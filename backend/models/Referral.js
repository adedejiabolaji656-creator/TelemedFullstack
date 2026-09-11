const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema(
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
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true,
    },
    toSpecialty: {
      type: String,
      required: true,
    },
    toHospital: String,
    toCity: String,
    reason: {
      type: String,
      required: true,
    },
    notes: String,
    status: {
      type: String,
      enum: ['sent', 'viewed', 'appointment_made', 'completed'],
      default: 'sent',
    },
  },
  { timestamps: true }
);

referralSchema.index({ patient: 1, createdAt: -1 });
referralSchema.index({ doctor: 1, createdAt: -1 });

module.exports = mongoose.model('Referral', referralSchema);