const express = require('express');
const { register, login, session, usernameAvailability } = require('../controllers/authController');
const requireAuth = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
// alias for compatibility
router.post('/signup', register);
router.post('/login', login);

// Public: check username availability and/or get a suggested available username
router.get('/username-availability', usernameAvailability);

// Active session
router.get('/session', requireAuth, session);

module.exports = router;
