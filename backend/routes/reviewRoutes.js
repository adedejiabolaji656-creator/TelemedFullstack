const router = require('express').Router();
const { protect } = require('../middleware/auth');
const {
  getDoctorReviews,
  createReview,
} = require('../controllers/reviewController');

router.get('/doctor/:id', getDoctorReviews);
router.post('/', protect, createReview);

module.exports = router;
