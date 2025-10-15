const express = require('express');
const { register, login } = require('../controllers/authController');

const router = express.Router();

router.post('/register', register);
// alias for compatibility
router.post('/signup', register);
router.post('/login', login);

module.exports = router;
