const Review = require('../models/Review');
const Appointment = require('../models/Appointment');
const DoctorProfile = require('../models/DoctorProfile');
const PatientProfile = require('../models/PatientProfile');

// @desc    Get reviews for a doctor
// @route   GET /api/reviews/doctor/:id
// @access  Public
exports.getDoctorReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      doctor: req.params.id,
      isVisible: true,
    })
      .populate({
        path: 'patient',
        populate: { path: 'user', select: 'name avatar' },
      })
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create / update a review
// @route   POST /api/reviews
// @access  Private (Patient)
exports.createReview = async (req, res) => {
  try {
    const { doctorId, appointmentId, rating, comment } = req.body;

    const patient = await PatientProfile.findOne({ user: req.user.id });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found',
      });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment || appointment.patient.toString() !== patient._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid appointment',
      });
    }

    if (appointment.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'You can only review completed appointments',
      });
    }

    let review = await Review.findOne({ patient: patient._id, appointment: appointmentId });

    if (review) {
      review.rating = rating;
      review.comment = comment || '';
      await review.save();
    } else {
      review = await Review.create({
        doctor: doctorId,
        patient: patient._id,
        appointment: appointmentId,
        rating,
        comment,
      });
    }

    // Recalculate doctor rating
    const reviews = await Review.find({ doctor: doctorId, isVisible: true });
    const avg =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;
    await DoctorProfile.findByIdAndUpdate(doctorId, {
      rating: Math.round(avg * 10) / 10,
      reviewCount: reviews.length,
    });

    res.status(201).json({
      success: true,
      review,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
