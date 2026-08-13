const router = require('express').Router();
const { protect } = require('../middleware/auth');
const {
  getPrescriptions,
  createPrescription,
  getPrescription,
} = require('../controllers/prescriptionController');

router.get('/', protect, getPrescriptions);
router.post('/', protect, createPrescription);
router.get('/:id', protect, getPrescription);

module.exports = router;
