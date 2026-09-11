const router = require('express').Router();
const { protect } = require('../middleware/auth');
const {
  getAppointments,
  getAppointment,
  bookAppointment,
  updateAppointment,
  cancelAppointment,
  completeConsultation,
  scheduleFollowUp,
} = require('../controllers/appointmentController');

router.get('/', protect, getAppointments);
router.get('/:id', protect, getAppointment);
router.post('/', protect, bookAppointment);
router.put('/:id', protect, updateAppointment);
router.put('/:id/complete', protect, completeConsultation);
router.post('/:id/follow-up', protect, scheduleFollowUp);
router.delete('/:id', protect, cancelAppointment);

module.exports = router;