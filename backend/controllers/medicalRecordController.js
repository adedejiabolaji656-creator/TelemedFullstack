const MedicalRecord = require('../models/MedicalRecord');
const PatientProfile = require('../models/PatientProfile');
const DoctorProfile = require('../models/DoctorProfile');
const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification');

// @desc    Get medical records
// @route   GET /api/medical-records
// @access  Private
exports.getMedicalRecords = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'patient') {
      const patient = await PatientProfile.findOne({ user: req.user.id });
      if (!patient) {
        return res.status(200).json({ success: true, count: 0, records: [] });
      }
      query.patient = patient._id;
    } else if (req.user.role === 'doctor') {
      const doctor = await DoctorProfile.findOne({ user: req.user.id });
      if (!doctor) {
        return res.status(200).json({ success: true, count: 0, records: [] });
      }
      // Only records created by this doctor OR records of patients this doctor
      // has had appointments with.
      const appointments = await Appointment.find({ doctor: doctor._id }).select('patient');
      const patientIds = appointments.map((a) => a.patient);
      query.$or = [{ doctor: doctor._id }, { patient: { $in: patientIds } }];
    }

    const records = await MedicalRecord.find(query)
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
      count: records.length,
      records,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create medical record
// @route   POST /api/medical-records
// @access  Private
exports.createMedicalRecord = async (req, res) => {
  try {
    const { patientId, title, description, type, documentUrl, tags } = req.body;

    let doctorId = null;
    if (req.user.role === 'doctor') {
      const doctor = await DoctorProfile.findOne({ user: req.user.id });
      doctorId = doctor ? doctor._id : null;
    } else if (req.user.role === 'patient') {
      // Patients may only create records for themselves
      const patient = await PatientProfile.findOne({ user: req.user.id });
      if (!patient || patient._id.toString() !== String(patientId)) {
        return res.status(403).json({
          success: false,
          message: 'Patients can only add records to their own profile',
        });
      }
    }

    const record = await MedicalRecord.create({
      patient: patientId,
      doctor: doctorId,
      title,
      description,
      type,
      documentUrl,
      tags,
    });

    // Notify patient
    const patientProfile = await PatientProfile.findById(patientId);
    if (patientProfile) {
      await Notification.create({
        user: patientProfile.user,
        title: 'New Medical Record',
        message: `A new medical record has been added: ${title}`,
        type: 'medical_record',
        link: `/patient/records`,
      });
    }

    res.status(201).json({
      success: true,
      record,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
