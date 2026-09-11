const stripe = require('../config/stripe');
const Appointment = require('../models/Appointment');
const PatientProfile = require('../models/PatientProfile');
const DoctorProfile = require('../models/DoctorProfile');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');

// @desc    Create Stripe PaymentIntent for an appointment
// @route   POST /api/payments/create-intent
// @access  Private (Patient)
exports.createPaymentIntent = async (req, res) => {
  try {
    const { appointmentId } = req.body;

    const appointment = await Appointment.findById(appointmentId).populate('doctor');
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    const patient = await PatientProfile.findOne({ user: req.user.id });
    if (!patient || appointment.patient.toString() !== patient._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You cannot pay for this appointment',
      });
    }

    let payment = await Payment.findOne({ appointment: appointment._id });
    if (!payment) {
      payment = await Payment.create({
        appointment: appointment._id,
        patient: patient._id,
        doctor: appointment.doctor._id,
        amount: appointment.doctor.consultationFee || 0,
        status: 'pending',
      });
    }

    if (!payment.stripePaymentIntentId) {
      const intent = await stripe.paymentIntents.create({
        amount: Math.round((payment.amount || 0) * 100),
        currency: 'usd',
        metadata: { appointmentId: appointment._id.toString() },
      });
      payment.stripePaymentIntentId = intent.id;
      await payment.save();
    }

    const intent = await stripe.paymentIntents.retrieve(payment.stripePaymentIntentId);

    res.status(200).json({
      success: true,
      clientSecret: intent.client_secret,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get payments for current user
// @route   GET /api/payments
// @access  Private
exports.getPayments = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'patient') {
      const patient = await PatientProfile.findOne({ user: req.user.id });
      query.patient = patient ? patient._id : null;
    } else if (req.user.role === 'doctor') {
      const doctor = await DoctorProfile.findOne({ user: req.user.id });
      query.doctor = doctor ? doctor._id : null;
    } else if (req.user.role === 'admin') {
      query = {};
    }

    const payments = await Payment.find(query)
      .populate({
        path: 'patient',
        populate: { path: 'user', select: 'name avatar' },
      })
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name avatar' },
      })
      .populate('appointment', 'scheduledDate')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Demo payment gateway (Naira). Mirrors a Paystack/Flutterwave
//          checkout. In production, replace with an Initialize endpoint +
//          webhook that verifies the reference before confirming.
// @route   POST /api/payments/mock-pay
// @access  Private (Patient)
exports.mockPay = async (req, res) => {
  try {
    const { appointmentId, method } = req.body;

    const appointment = await Appointment.findById(appointmentId).populate('doctor');
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    const patient = await PatientProfile.findOne({ user: req.user.id });
    if (!patient || appointment.patient.toString() !== patient._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You cannot pay for this appointment',
      });
    }

    let payment = await Payment.findOne({ appointment: appointment._id });
    if (!payment) {
      payment = await Payment.create({
        appointment: appointment._id,
        patient: patient._id,
        doctor: appointment.doctor._id,
        amount: appointment.doctor.consultationFee || 0,
        currency: 'ngn',
        method: 'mock',
        status: 'pending',
      });
    }

    if (payment.status === 'completed') {
      return res
        .status(200)
        .json({ success: true, message: 'Already paid', payment });
    }

    payment.status = 'completed';
    payment.method = ['card', 'bank_transfer', 'ussd', 'qr', 'wallet'].includes(method)
      ? method
      : 'mock';
    payment.reference = `PSK-${Date.now().toString(36).toUpperCase()}`;
    payment.paidAt = new Date();
    await payment.save();

    await Appointment.findByIdAndUpdate(appointment._id, { status: 'confirmed' });

    const doctor = await DoctorProfile.findById(payment.doctor).populate('user', 'name');
    if (doctor) {
      await Notification.create({
        user: doctor.user,
        title: 'Payment Received',
        message: `Payment of ₦${payment.amount.toLocaleString()} received for your consultation`,
        type: 'payment',
        link: `/doctor/appointments`,
      });
    }

    res.status(200).json({ success: true, payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Stripe webhook handler
// @route   POST /api/payments/webhook
// @access  Public (Stripe)
exports.handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object;
    const payment = await Payment.findOneAndUpdate(
      { stripePaymentIntentId: intent.id },
      { status: 'completed', paidAt: new Date() },
      { new: true }
    );
    if (payment) {
      await Appointment.findByIdAndUpdate(payment.appointment, {
        status: 'confirmed',
      });
      const doctor = await DoctorProfile.findById(payment.doctor).populate('user', 'name');
      await Notification.create({
        user: doctor.user,
        title: 'Payment Received',
        message: `Payment of ₦${payment.amount.toLocaleString()} received for your consultation`,
        type: 'payment',
        link: `/doctor/appointments`,
      });
    }
  }

  if (event.type === 'payment_intent.payment_failed') {
    const intent = event.data.object;
    await Payment.findOneAndUpdate(
      { stripePaymentIntentId: intent.id },
      { status: 'failed' }
    );
  }

  res.json({ received: true });
};
