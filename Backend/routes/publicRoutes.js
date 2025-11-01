const express = require('express');
const router = express.Router();

// Controllers
const startupProfileController = require('../controllers/startupProfileController');

// Public (no-auth) endpoints
// Returns public-facing startup profile, including base64 logo if present
router.get('/startup-profile/:username', startupProfileController.getPublicProfileByUsername);

module.exports = router;
