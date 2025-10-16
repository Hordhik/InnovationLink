const express = require('express');
const { register, login, session } = require('../controllers/authController');
const requireAuth = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
// alias for compatibility
router.post('/signup', register);
router.post('/login', login);

// Active session
router.get('/session', requireAuth, session);

module.exports = router;
