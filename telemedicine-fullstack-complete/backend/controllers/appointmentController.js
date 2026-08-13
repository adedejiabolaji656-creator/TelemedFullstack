const Appointment = require('../models/Appointment');
const DoctorProfile = require('../models/DoctorProfile');
const PatientProfile = require('../models/PatientProfile');
const Availability = require('../models/Availability');
const ChatRoom = require('../models/ChatRoom');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const { v4: uuidv4 } = require('uuid');

const calcEndTime = (scheduledDate, startTime, durationMinutes = 30) => {
  const [h, m] = startTime.split(':').map(Number);
  const date = new Date(scheduledDate);
  date.setHours(h, m + durationMinutes, 0, 0);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

// @desc    Get appointments for current user
// @route   GET /api/appointments
// @access  Private
exports.getAppointments = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'patient') {
      const patient = await PatientProfile.findOne({ user: req.user.id });
      query.patient = patient ? patient._id : null;
    } else if (req.user.role === 'doctor') {
      const doctor = await DoctorProfile.findOne({ user: req.user.id });
      query.doctor = doctor ? doctor._id : null;
    }

    const { status } = req.query;
    if (status) query.status = status;

    const appointments = await Appointment.find(query)
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

// @desc    Get single appointment
// @route   GET /api/appointments/:id
// @access  Private
exports.getAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate({
        path: 'patient',
        populate: { path: 'user', select: 'name avatar email phone' },
      })
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name avatar email specialization' },
      });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    // Authorization: only the involved patient, doctor, or admin may view
    if (req.user.role !== 'admin') {
      let allowed = false;
      if (req.user.role === 'patient') {
        const patient = await PatientProfile.findOne({ user: req.user.id });
        allowed = patient && appointment.patient.toString() === patient._id.toString();
      } else if (req.user.role === 'doctor') {
        const doctor = await DoctorProfile.findOne({ user: req.user.id });
        allowed = doctor && appointment.doctor.toString() === doctor._id.toString();
      }
      if (!allowed) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view this appointment',
        });
      }
    }

    // Attach payment if present
    const payment = await Payment.findOne({ appointment: appointment._id });

    res.status(200).json({
      success: true,
      appointment: {
        ...appointment.toObject(),
        payment,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Book appointment
// @route   POST /api/appointments
// @access  Private (Patient)
exports.bookAppointment = async (req, res) => {
  try {
    const { doctorId, availabilityId, scheduledDate, startTime, type, symptoms } = req.body;

    const patient = await PatientProfile.findOne({ user: req.user.id });
    if (!patient) {
      return res.status(400).json({
        success: false,
        message: 'Patient profile not found. Please complete your profile.',
      });
    }

    const doctor = await DoctorProfile.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
    }

    if (doctor.user.toString() === req.user.id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot book an appointment with yourself',
      });
    }

    if (doctor.verificationStatus !== 'verified') {
      return res.status(400).json({
        success: false,
        message: 'Doctor is not verified yet',
      });
    }

    // Check availability
    let availability = null;
    if (availabilityId) {
      availability = await Availability.findById(availabilityId);
      if (!availability || availability.isBooked) {
        return res.status(400).json({
          success: false,
          message: 'Slot is not available',
        });
      }
    }

    // Check overlapping appointment for this doctor/time
    const overlap = await Appointment.findOne({
      doctor: doctor._id,
      scheduledDate: {
        $gte: new Date(new Date(scheduledDate).setHours(0, 0, 0, 0)),
        $lt: new Date(new Date(scheduledDate).setHours(23, 59, 59, 999)),
      },
      startTime,
      status: { $nin: ['cancelled', 'no_show'] },
    });
    if (overlap) {
      return res.status(400).json({
        success: false,
        message: 'This time slot has already been booked',
      });
    }

    const endTime = calcEndTime(new Date(scheduledDate), startTime);
    const roomId = uuidv4();

    // Create appointment
    const appointment = await Appointment.create({
      patient: patient._id,
      doctor: doctor._id,
      availability: availabilityId || null,
      scheduledDate: new Date(scheduledDate),
      startTime,
      endTime,
      type: type || 'video',
      symptoms,
      roomId,
      status: 'pending',
    });

    // Mark slot as booked
    if (availability) {
      availability.isBooked = true;
      await availability.save();
    }

    // Create chat room
    await ChatRoom.create({
      appointment: appointment._id,
      participants: [req.user.id, doctor.user],
    });

    // Create payment record
    await Payment.create({
      appointment: appointment._id,
      patient: patient._id,
      doctor: doctor._id,
      amount: doctor.consultationFee,
      status: 'pending',
    });

    // Notify doctor
    await Notification.create({
      user: doctor.user,
      title: 'New Appointment Request',
      message: `${req.user.name} has requested an appointment`,
      type: 'appointment',
      link: `/doctor/appointments`,
    });

    res.status(201).json({
      success: true,
      appointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update appointment status
// @route   PUT /api/appointments/:id
// @access  Private
exports.updateAppointment = async (req, res) => {
  try {
    const { status, notes, meetingLink } = req.body;

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    // Authorization check
    const doctor = await DoctorProfile.findOne({ user: req.user.id });
    const patient = await PatientProfile.findOne({ user: req.user.id });

    const isDoctor = doctor && appointment.doctor.toString() === doctor._id.toString();
    const isPatient = patient && appointment.patient.toString() === patient._id.toString();

    if (!isDoctor && !isPatient && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    // Only the doctor (or admin) may confirm a consultation
    if (status === 'confirmed' && !isDoctor && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only the doctor can confirm an appointment',
      });
    }

    appointment.status = status || appointment.status;
    appointment.notes = notes || appointment.notes;
    appointment.meetingLink = meetingLink || appointment.meetingLink;

    await appointment.save();

    // Notify the other party
    let otherProfile = null;
    if (isDoctor) {
      otherProfile = await PatientProfile.findById(appointment.patient);
    } else if (isPatient) {
      otherProfile = await DoctorProfile.findById(appointment.doctor);
    }

    if (otherProfile) {
      await Notification.create({
        user: otherProfile.user,
        title: 'Appointment Updated',
        message: `Your appointment has been ${status}`,
        type: 'appointment',
        link: `/appointments/${appointment._id}`,
      });
    }

    res.status(200).json({
      success: true,
      appointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Cancel appointment
// @route   DELETE /api/appointments/:id
// @access  Private
exports.cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    // Authorization check
    const doctor = await DoctorProfile.findOne({ user: req.user.id });
    const patient = await PatientProfile.findOne({ user: req.user.id });

    const isDoctor = doctor && appointment.doctor.toString() === doctor._id.toString();
    const isPatient = patient && appointment.patient.toString() === patient._id.toString();

    if (!isDoctor && !isPatient && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this appointment',
      });
    }

    if (appointment.status === 'completed' || appointment.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel an appointment that is already ${appointment.status}`,
      });
    }

    appointment.status = 'cancelled';
    appointment.cancelledBy = req.user.id;
    appointment.cancellationReason = req.body.reason;

    await appointment.save();

    // Free up availability slot
    if (appointment.availability) {
      await Availability.findByIdAndUpdate(appointment.availability, {
        isBooked: false,
      });
    }

    // Notify the other party
    let otherProfile = null;
    if (isDoctor) {
      otherProfile = await PatientProfile.findById(appointment.patient);
    } else if (isPatient) {
      otherProfile = await DoctorProfile.findById(appointment.doctor);
    }
    if (otherProfile) {
      await Notification.create({
        user: otherProfile.user,
        title: 'Appointment Cancelled',
        message: `Your appointment has been cancelled`,
        type: 'appointment',
        link: `/appointments/${appointment._id}`,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Appointment cancelled',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
