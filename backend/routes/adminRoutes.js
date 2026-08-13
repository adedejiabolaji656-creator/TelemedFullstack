const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getStats,
  getDoctors,
  verifyDoctor,
  getAppointments,
  getPayments,
} = require('../controllers/adminController');

router.get('/stats', protect, authorize('admin'), getStats);
router.get('/doctors', protect, authorize('admin'), getDoctors);
router.put('/doctors/:id/verify', protect, authorize('admin'), verifyDoctor);
router.get('/appointments', protect, authorize('admin'), getAppointments);
router.get('/payments', protect, authorize('admin'), getPayments);

module.exports = router;
