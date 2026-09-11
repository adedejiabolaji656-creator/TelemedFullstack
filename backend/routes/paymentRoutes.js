const router = require('express').Router();
const { protect } = require('../middleware/auth');
const {
  createPaymentIntent,
  getPayments,
  mockPay,
} = require('../controllers/paymentController');

router.get('/', protect, getPayments);
router.post('/create-intent', protect, createPaymentIntent);
router.post('/mock-pay', protect, mockPay);

module.exports = router;