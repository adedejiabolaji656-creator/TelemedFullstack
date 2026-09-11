const mongoose = require('mongoose');

const pharmacyItemSchema = new mongoose.Schema(
  {
    medication: String,
    dosage: String,
    quantity: { type: Number, default: 1 },
    pricePerUnit: { type: Number, default: 0 },
  },
  { _id: false }
);

const pharmacyOrderSchema = new mongoose.Schema(
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
    prescription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Prescription',
      required: true,
    },
    pharmacy: {
      name: String,
      city: String,
      state: String,
      address: String,
      phone: String,
    },
    items: [pharmacyItemSchema],
    total: {
      type: Number,
      default: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    status: {
      type: String,
      enum: ['placed', 'confirmed', 'preparing', 'ready_for_pickup', 'delivering', 'delivered', 'cancelled'],
      default: 'placed',
    },
    deliveryMethod: {
      type: String,
      enum: ['pickup', 'delivery'],
      default: 'pickup',
    },
    deliveryAddress: String,
    trackingNote: String,
  },
  { timestamps: true }
);

pharmacyOrderSchema.index({ patient: 1, createdAt: -1 });
pharmacyOrderSchema.index({ prescription: 1 });

module.exports = mongoose.model('PharmacyOrder', pharmacyOrderSchema);