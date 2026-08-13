const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PatientProfile',
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DoctorProfile',
      required: true,
    },
    availability: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Availability',
    },
    scheduledDate: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'],
      default: 'pending',
    },
    type: {
      type: String,
      enum: ['video', 'chat', 'in_person'],
      default: 'video',
    },
    symptoms: {
      type: String,
      maxlength: 2000,
    },
    notes: {
      type: String,
      maxlength: 2000,
    },
    diagnosis: {
      type: String,
      maxlength: 2000,
    },
    meetingLink: String,
    roomId: {
      type: String,
      unique: true,
      sparse: true,
    },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    cancellationReason: String,
  },
  { timestamps: true }
);

appointmentSchema.index({ patient: 1, scheduledDate: -1 });
appointmentSchema.index({ doctor: 1, scheduledDate: -1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
