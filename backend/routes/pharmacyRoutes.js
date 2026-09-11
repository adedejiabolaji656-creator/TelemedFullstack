const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const pharmacyController = require('../controllers/pharmacyController');

router.route('/').get(protect, pharmacyController.getPharmacyOrders);
router.route('/').post(protect, pharmacyController.createPharmacyOrder);
router
  .route('/:id/status')
  .put(protect, pharmacyController.updatePharmacyStatus);
router.route('/:id').get(protect, pharmacyController.getPharmacyOrder);

module.exports = router;