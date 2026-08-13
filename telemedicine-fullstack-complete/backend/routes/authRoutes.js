const router = require('express').Router();
const {
  register,
  login,
  getMe,
  updateProfile,
  updatePatientProfile,
  updateDoctorProfile,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/patient-profile', protect, updatePatientProfile);
router.put('/doctor-profile', protect, updateDoctorProfile);

module.exports = router;
