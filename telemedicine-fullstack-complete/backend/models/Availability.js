const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DoctorProfile',
      required: true,
    },
    dayOfWeek: {
      type: Number,
      min: 0,
      max: 6,
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
    isRecurring: {
      type: Boolean,
      default: true,
    },
    specificDate: Date,
    isBooked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

availabilitySchema.index({ doctor: 1, dayOfWeek: 1, startTime: 1 });

module.exports = mongoose.model('Availability', availabilitySchema);
