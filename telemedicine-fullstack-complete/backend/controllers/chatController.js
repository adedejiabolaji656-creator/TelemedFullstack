const ChatRoom = require('../models/ChatRoom');
const Appointment = require('../models/Appointment');
const PatientProfile = require('../models/PatientProfile');
const DoctorProfile = require('../models/DoctorProfile');

// @desc    Get chat messages for a room
// @route   GET /api/chat/:roomId/messages
// @access  Private (participants only)
exports.getMessages = async (req, res) => {
  try {
    const appointment = await Appointment.findOne({ roomId: req.params.roomId });
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Chat room not found',
      });
    }

    // Authorization: only the involved patient/doctor
    let allowed = false;
    if (req.user.role === 'patient') {
      const patient = await PatientProfile.findOne({ user: req.user.id });
      allowed = patient && appointment.patient.toString() === patient._id.toString();
    } else if (req.user.role === 'doctor') {
      const doctor = await DoctorProfile.findOne({ user: req.user.id });
      allowed = doctor && appointment.doctor.toString() === doctor._id.toString();
    } else if (req.user.role === 'admin') {
      allowed = true;
    }

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this chat',
      });
    }

    const chatRoom = await ChatRoom.findOne({ appointment: appointment._id }).populate(
      'messages.sender',
      'name avatar'
    );

    res.status(200).json({
      success: true,
      messages: chatRoom ? chatRoom.messages : [],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
