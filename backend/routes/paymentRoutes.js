const router = require('express').Router();
const { protect } = require('../middleware/auth');
const {
  createPaymentIntent,
  getPayments,
} = require('../controllers/paymentController');

router.get('/', protect, getPayments);
router.post('/create-intent', protect, createPaymentIntent);

module.exports = router;
