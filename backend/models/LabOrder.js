const mongoose = require('mongoose');

const labResultSchema = new mongoose.Schema(
  {
    test: String,
    result: String,
    unit: String,
    referenceRange: String,
    flag: {
      type: String,
      enum: ['normal', 'low', 'high', ''],
      default: '',
    },
  },
  { _id: false }
);

const labOrderSchema = new mongoose.Schema(
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
    panelName: {
      type: String,
    },
    tests: {
      type: [String],
      required: true,
    },
    reason: String,
    notes: String,
    lab: {
      name: String,
      city: String,
      state: String,
      address: String,
      phone: String,
    },
    amount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['requested', 'ordered', 'sample_collected', 'results_ready', 'completed', 'cancelled'],
      default: 'requested',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid'],
      default: 'pending',
    },
    results: [labResultSchema],
    resultsSummary: String,
    resultDate: Date,
  },
  { timestamps: true }
);

labOrderSchema.index({ patient: 1, createdAt: -1 });
labOrderSchema.index({ doctor: 1, createdAt: -1 });

module.exports = mongoose.model('LabOrder', labOrderSchema);