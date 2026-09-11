const Referral = require('../models/Referral');
const Appointment = require('../models/Appointment');
const DoctorProfile = require('../models/DoctorProfile');
const PatientProfile = require('../models/PatientProfile');
const Notification = require('../models/Notification');

// @desc    Get referrals for current user
// @route   GET /api/referrals
// @access  Private
exports.getReferrals = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'patient') {
      const patient = await PatientProfile.findOne({ user: req.user.id });
      query.patient = patient ? patient._id : null;
    } else if (req.user.role === 'doctor') {
      const doctor = await DoctorProfile.findOne({ user: req.user.id });
      query.doctor = doctor ? doctor._id : null;
    }

    const referrals = await Referral.find(query)
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

    res.status(200).json({ success: true, count: referrals.length, referrals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single referral
// @route   GET /api/referrals/:id
// @access  Private
exports.getReferral = async (req, res) => {
  try {
    const referral = await Referral.findById(req.params.id)
      .populate({
        path: 'patient',
        populate: { path: 'user', select: 'name avatar' },
      })
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name avatar' },
      });

    if (!referral) {
      return res.status(404).json({ success: false, message: 'Referral not found' });
    }

    const patient = await PatientProfile.findOne({ user: req.user.id });
    const doctor = await DoctorProfile.findOne({ user: req.user.id });
    const isPatient = patient && referral.patient.toString() === patient._id.toString();
    const isDoctor = doctor && referral.doctor.toString() === doctor._id.toString();

    if (!isPatient && !isDoctor && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.status(200).json({ success: true, referral });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Doctor refers a patient to a specialty / hospital
// @route   POST /api/referrals
// @access  Private (Doctor)
exports.createReferral = async (req, res) => {
  try {
    const { appointmentId, toSpecialty, toHospital, toCity, reason, notes } = req.body;

    const doctor = await DoctorProfile.findOne({ user: req.user.id });
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment || appointment.doctor.toString() !== doctor._id.toString()) {
      return res.status(400).json({ success: false, message: 'Invalid appointment' });
    }

    if (!toSpecialty || !reason) {
      return res
        .status(400)
        .json({ success: false, message: 'Specialty and reason are required' });
    }

    const referral = await Referral.create({
      patient: appointment.patient,
      doctor: doctor._id,
      appointment: appointment._id,
      toSpecialty,
      toHospital,
      toCity,
      reason,
      notes,
      status: 'sent',
    });

    const patientProfile = await PatientProfile.findById(appointment.patient);
    if (patientProfile) {
      await Notification.create({
        user: patientProfile.user,
        title: 'Specialist Referral',
        message: `Dr. ${req.user.name} has referred you to ${toHospital ? toHospital + ' (' + toSpecialty + ')' : toSpecialty}`,
        type: 'medical_record',
        link: `/patient/referrals`,
      });
    }

    res.status(201).json({ success: true, referral });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};