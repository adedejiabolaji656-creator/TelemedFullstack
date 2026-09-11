const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const labController = require('../controllers/labController');

router.route('/').get(protect, labController.getLabOrders);
router.route('/').post(protect, labController.createLabRequest);
router
  .route('/:id/book')
  .post(protect, labController.bookLab);
router
  .route('/:id/sample')
  .post(protect, labController.collectSample);
router
  .route('/:id/results')
  .post(protect, labController.addLabResults);
router.route('/:id').get(protect, labController.getLabOrder);

module.exports = router;