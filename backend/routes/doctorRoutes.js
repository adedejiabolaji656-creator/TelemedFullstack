const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getDoctors,
  getSpecializations,
  getDoctor,
  getAvailability,
  addAvailability,
  deleteAvailability,
  uploadDocuments,
  getMyProfile,
  getAppointmentPatient,
} = require('../controllers/doctorController');

router.get('/', getDoctors);
router.get('/specializations', getSpecializations);
router.get('/me', protect, authorize('doctor'), getMyProfile);
router.get(
  '/appointments/:appointmentId/patient',
  protect,
  authorize('doctor'),
  getAppointmentPatient
);
router.get('/:id/availability', getAvailability);
router.get('/:id', getDoctor);
router.post('/availability', protect, authorize('doctor'), addAvailability);
router.delete('/availability/:id', protect, authorize('doctor'), deleteAvailability);
router.post('/documents', protect, authorize('doctor'), upload.single('document'), uploadDocuments);

module.exports = router;
