const PharmacyOrder = require('../models/PharmacyOrder');
const Prescription = require('../models/Prescription');
const DoctorProfile = require('../models/DoctorProfile');
const PatientProfile = require('../models/PatientProfile');
const Notification = require('../models/Notification');

// @desc    Get pharmacy orders for current user
// @route   GET /api/pharmacy
// @access  Private
exports.getPharmacyOrders = async (req, res) => {
  try {
    let query = {};
    const { status } = req.query;

    if (req.user.role === 'patient') {
      const patient = await PatientProfile.findOne({ user: req.user.id });
      query.patient = patient ? patient._id : null;
    } else if (req.user.role === 'doctor') {
      const doctor = await DoctorProfile.findOne({ user: req.user.id });
      query.doctor = doctor ? doctor._id : null;
    }
    if (status) query.status = status;

    const pharmacyOrders = await PharmacyOrder.find(query)
      .populate({
        path: 'patient',
        populate: { path: 'user', select: 'name avatar phone' },
      })
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name avatar' },
      })
      .populate('prescription', 'diagnosis')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: pharmacyOrders.length, pharmacyOrders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single pharmacy order
// @route   GET /api/pharmacy/:id
// @access  Private
exports.getPharmacyOrder = async (req, res) => {
  try {
    const pharmacyOrder = await PharmacyOrder.findById(req.params.id)
      .populate({
        path: 'patient',
        populate: { path: 'user', select: 'name avatar phone' },
      })
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name avatar' },
      })
      .populate('prescription');

    if (!pharmacyOrder) {
      return res.status(404).json({ success: false, message: 'Pharmacy order not found' });
    }

    const patient = await PatientProfile.findOne({ user: req.user.id });
    const doctor = await DoctorProfile.findOne({ user: req.user.id });
    const isPatient = patient && pharmacyOrder.patient.toString() === patient._id.toString();
    const isDoctor = doctor && pharmacyOrder.doctor.toString() === doctor._id.toString();

    if (!isPatient && !isDoctor && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.status(200).json({ success: true, pharmacyOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Patient orders medication from a partner pharmacy (demo gateway)
// @route   POST /api/pharmacy
// @access  Private (Patient)
exports.createPharmacyOrder = async (req, res) => {
  try {
    const { prescriptionId, pharmacy, deliveryMethod, deliveryAddress, items } = req.body;

    const patient = await PatientProfile.findOne({ user: req.user.id });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient profile not found' });
    }

    const prescription = await Prescription.findById(prescriptionId).populate('doctor');
    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }
    if (prescription.patient.toString() !== patient._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const orderItems =
      Array.isArray(items) && items.length > 0
        ? items.map((item) => ({
            medication: item.medication || '',
            dosage: item.dosage || '',
            quantity: Number(item.quantity) || 1,
            pricePerUnit: Number(item.pricePerUnit) || 0,
          }))
        : (prescription.medications || []).map((med) => ({
            medication: med.name,
            dosage: `${med.dosage} ${med.frequency || ''}`.trim(),
            quantity: 1,
            pricePerUnit: 0,
          }));

    const total = orderItems.reduce(
      (sum, item) => sum + item.quantity * item.pricePerUnit,
      0
    );

    const pharmacyOrder = await PharmacyOrder.create({
      patient: patient._id,
      doctor: prescription.doctor,
      prescription: prescription._id,
      pharmacy: pharmacy || {},
      items: orderItems,
      total,
      paymentStatus: 'paid',
      reference: `PHX-${Date.now().toString(36).toUpperCase()}`,
      status: 'placed',
      deliveryMethod: deliveryMethod || 'pickup',
      deliveryAddress: deliveryMethod === 'delivery' ? deliveryAddress : '',
    });

    // Notify the doctor who wrote the prescription
    if (prescription.doctor) {
      const doctorProfile = await DoctorProfile.findById(prescription.doctor);
      if (doctorProfile) {
        await Notification.create({
          user: doctorProfile.user,
          title: 'Medication Order Placed',
          message: `${req.user.name} ordered medication against your prescription at ${pharmacy.name || 'a partner pharmacy'}`,
          type: 'prescription',
          link: `/doctor/pharmacy`,
        });
      }
    }

    res.status(201).json({ success: true, pharmacyOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Advance order status (demo — in production the pharmacist updates this)
// @route   PUT /api/pharmacy/:id/status
// @access  Private (involved patient/doctor)
exports.updatePharmacyStatus = async (req, res) => {
  try {
    const { status, trackingNote } = req.body;

    const pharmacyOrder = await PharmacyOrder.findById(req.params.id);
    if (!pharmacyOrder) {
      return res.status(404).json({ success: false, message: 'Pharmacy order not found' });
    }

    const patient = await PatientProfile.findOne({ user: req.user.id });
    const doctor = await DoctorProfile.findOne({ user: req.user.id });
    const isPatient = patient && pharmacyOrder.patient.toString() === patient._id.toString();
    const isDoctor = doctor && pharmacyOrder.doctor.toString() === doctor._id.toString();

    if (!isPatient && !isDoctor && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const validTransitions = {
      placed: ['confirmed', 'cancelled'],
      confirmed: ['preparing', 'cancelled'],
      preparing: ['ready_for_pickup', 'delivering'],
      ready_for_pickup: ['delivered'],
      delivering: ['delivered'],
      delivered: [],
      cancelled: [],
    };

    if (!status || !validTransitions[pharmacyOrder.status].includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot move order from ${pharmacyOrder.status} to ${status || 'that'} state`,
      });
    }

    pharmacyOrder.status = status;
    if (trackingNote) pharmacyOrder.trackingNote = trackingNote;
    await pharmacyOrder.save();

    if (status === 'delivered') {
      const patientProfile = await PatientProfile.findById(pharmacyOrder.patient);
      if (patientProfile) {
        await Notification.create({
          user: patientProfile.user,
          title: 'Medication Delivered',
          message: 'Your pharmacy order has been delivered. Stay healthy!',
          type: 'prescription',
          link: `/patient/pharmacy`,
        });
      }
    }

    res.status(200).json({ success: true, pharmacyOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};