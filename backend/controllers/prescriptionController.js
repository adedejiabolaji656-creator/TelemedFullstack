const Prescription = require('../models/Prescription');
const Appointment = require('../models/Appointment');
const DoctorProfile = require('../models/DoctorProfile');
const PatientProfile = require('../models/PatientProfile');
const Notification = require('../models/Notification');

// @desc    Get prescriptions for current user
// @route   GET /api/prescriptions
// @access  Private
exports.getPrescriptions = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'patient') {
      const patient = await PatientProfile.findOne({ user: req.user.id });
      query.patient = patient ? patient._id : null;
    } else if (req.user.role === 'doctor') {
      const doctor = await DoctorProfile.findOne({ user: req.user.id });
      query.doctor = doctor ? doctor._id : null;
    }

    const prescriptions = await Prescription.find(query)
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name avatar' },
      })
      .populate({
        path: 'patient',
        populate: { path: 'user', select: 'name avatar' },
      })
      .populate('appointment', 'scheduledDate')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: prescriptions.length,
      prescriptions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create prescription
// @route   POST /api/prescriptions
// @access  Private (Doctor)
exports.createPrescription = async (req, res) => {
  try {
    const { appointmentId, diagnosis, notes, medications, validUntil } = req.body;

    const doctor = await DoctorProfile.findOne({ user: req.user.id });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found',
      });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment || appointment.doctor.toString() !== doctor._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid appointment',
      });
    }

    const prescription = await Prescription.create({
      appointment: appointmentId,
      doctor: doctor._id,
      patient: appointment.patient,
      diagnosis,
      notes,
      medications,
      validUntil: validUntil ? new Date(validUntil) : null,
    });

    // Update appointment status
    appointment.status = 'completed';
    await appointment.save();

    // Notify patient
    const patientProfile = await PatientProfile.findById(appointment.patient);
    if (patientProfile) {
      await Notification.create({
        user: patientProfile.user,
        title: 'New Prescription',
        message: `Dr. ${req.user.name} has issued a prescription for you`,
        type: 'prescription',
        link: `/patient/prescriptions`,
      });
    }

    res.status(201).json({
      success: true,
      prescription,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single prescription
// @route   GET /api/prescriptions/:id
// @access  Private
exports.getPrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name avatar' },
      })
      .populate({
        path: 'patient',
        populate: { path: 'user', select: 'name avatar' },
      })
      .populate('appointment', 'scheduledDate startTime endTime');

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found',
      });
    }

    // Authorization: involved patient/doctor or admin
    if (req.user.role !== 'admin') {
      let allowed = false;
      if (req.user.role === 'patient') {
        const patient = await PatientProfile.findOne({ user: req.user.id });
        allowed = patient && prescription.patient.toString() === patient._id.toString();
      } else if (req.user.role === 'doctor') {
        const doctor = await DoctorProfile.findOne({ user: req.user.id });
        allowed = doctor && prescription.doctor.toString() === doctor._id.toString();
      }
      if (!allowed) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view this prescription',
        });
      }
    }

    res.status(200).json({
      success: true,
      prescription,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
