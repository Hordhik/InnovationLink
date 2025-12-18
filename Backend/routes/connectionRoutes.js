const express = require('express');
const router = express.Router();
const connectionController = require('../controllers/connectionController');
const authMiddleware = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

router.post('/request', connectionController.sendRequest);
router.post('/cancel', connectionController.cancelRequest);
router.post('/accept', connectionController.acceptRequest);
router.post('/reject', connectionController.rejectRequest);
router.post('/block', connectionController.blockUser);
router.get('/list', connectionController.getConnections);
router.get('/requests', connectionController.getPendingRequests);
router.get('/status/:targetUserId', connectionController.getConnectionStatus);

module.exports = router;
