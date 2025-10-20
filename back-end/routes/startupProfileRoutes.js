const express = require('express');
const requireAuth = require('../middleware/auth');
const { getProfile, saveProfile } = require('../controllers/startupProfileController');

const router = express.Router();

// Protected endpoints: require JWT
router.get('/', requireAuth, getProfile);
router.post('/', requireAuth, saveProfile); // create or update

module.exports = router;
