const User = require('../models/User');
const DoctorProfile = require('../models/DoctorProfile');
const PatientProfile = require('../models/PatientProfile');
const Appointment = require('../models/Appointment');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private (Admin)
exports.getStats = async (req, res) => {
  try {
    const [
      users,
      doctors,
      patients,
      appointments,
      pendingDoctors,
      completedPayments,
    ] = await Promise.all([
      User.countDocuments(),
      DoctorProfile.countDocuments(),
      PatientProfile.countDocuments(),
      Appointment.countDocuments(),
      DoctorProfile.countDocuments({ verificationStatus: 'pending' }),
      Payment.find({ status: 'completed' }),
    ]);

    const revenue = completedPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

    res.status(200).json({
      success: true,
      stats: {
        users,
        doctors,
        patients,
        appointments,
        pendingDoctors,
        revenue,
        completedAppointments: await Appointment.countDocuments({ status: 'completed' }),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all doctor profiles (optionally filtered by status)
// @route   GET /api/admin/doctors
// @access  Private (Admin)
exports.getDoctors = async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status) query.verificationStatus = status;

    const doctors = await DoctorProfile.find(query)
      .populate('user', 'name email avatar phone createdAt')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: doctors.length,
      doctors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Verify / reject a doctor
// @route   PUT /api/admin/doctors/:id/verify
// @access  Private (Admin)
exports.verifyDoctor = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;

    const doctor = await DoctorProfile.findById(req.params.id).populate('user', 'name');
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
    }

    if (!['verified', 'rejected', 'under_review', 'pending'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification status',
      });
    }

    doctor.verificationStatus = status;
    if (status === 'verified') {
      doctor.verifiedAt = new Date();
      doctor.rejectionReason = undefined;
    } else if (status === 'rejected') {
      doctor.rejectionReason = rejectionReason || 'No reason provided';
    }

    await doctor.save();

    // Notify the doctor
    const message =
      status === 'verified'
        ? 'Congratulations! Your profile has been verified. You can now accept appointments.'
        : status === 'rejected'
        ? `Your profile was rejected. Reason: ${doctor.rejectionReason}`
        : `Your verification status is now ${status}`;

    await Notification.create({
      user: doctor.user,
      title: 'Verification Update',
      message,
      type: 'verification',
      link: `/doctor/dashboard`,
    });

    res.status(200).json({
      success: true,
      doctor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all appointments
// @route   GET /api/admin/appointments
// @access  Private (Admin)
exports.getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({})
      .populate({
        path: 'patient',
        populate: { path: 'user', select: 'name avatar email phone' },
      })
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name avatar email' },
      })
      .sort({ scheduledDate: -1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all payments
// @route   GET /api/admin/payments
// @access  Private (Admin)
exports.getPayments = async (req, res) => {
  try {
    const payments = await Payment.find({})
      .populate({
        path: 'patient',
        populate: { path: 'user', select: 'name avatar' },
      })
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name avatar' },
      })
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
