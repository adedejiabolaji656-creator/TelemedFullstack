const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    dosage: {
      type: String,
      required: true,
    },
    frequency: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },
    instructions: String,
  },
  { _id: true }
);

const prescriptionSchema = new mongoose.Schema(
  {
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true,
      unique: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DoctorProfile',
      required: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PatientProfile',
      required: true,
    },
    diagnosis: {
      type: String,
      required: true,
    },
    notes: String,
    medications: [medicationSchema],
    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled'],
      default: 'active',
    },
    validUntil: Date,
    pdfUrl: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Prescription', prescriptionSchema);
