const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { getMessages } = require('../controllers/chatController');

router.get('/:roomId/messages', protect, getMessages);

module.exports = router;
