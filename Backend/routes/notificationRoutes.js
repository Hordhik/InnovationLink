const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

router.get('/', notificationController.getNotifications);
router.post('/read', notificationController.markAsRead);
router.post('/unread', notificationController.markAsUnread);

module.exports = router;
