const router = require('express').Router();
const { protect } = require('../middleware/auth');
const {
  getAppointments,
  getAppointment,
  bookAppointment,
  updateAppointment,
  cancelAppointment,
} = require('../controllers/appointmentController');

router.get('/', protect, getAppointments);
router.get('/:id', protect, getAppointment);
router.post('/', protect, bookAppointment);
router.put('/:id', protect, updateAppointment);
router.delete('/:id', protect, cancelAppointment);

module.exports = router;
