const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const referralController = require('../controllers/referralController');

router.route('/').get(protect, referralController.getReferrals);
router.route('/').post(protect, referralController.createReferral);
router.route('/:id').get(protect, referralController.getReferral);

module.exports = router;