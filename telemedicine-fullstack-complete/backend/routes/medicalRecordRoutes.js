const router = require('express').Router();
const { protect } = require('../middleware/auth');
const {
  getMedicalRecords,
  createMedicalRecord,
} = require('../controllers/medicalRecordController');

router.get('/', protect, getMedicalRecords);
router.post('/', protect, createMedicalRecord);

module.exports = router;
