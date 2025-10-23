const express = require('express');
const requireAuth = require('../middleware/auth');
const { getProfile, saveProfile, getAllProfilesWithTeamCounts } = require('../controllers/startupProfileController');

const router = express.Router();

// Protected endpoints: require JWT
router.get('/', requireAuth, getProfile);
router.post('/', requireAuth, saveProfile); // create or update

// List all startup profiles (lightweight) with team member counts
router.get('/all', requireAuth, getAllProfilesWithTeamCounts);

module.exports = router;
