const express = require('express');
const requireAuth = require('../middleware/auth');
const requireRole = require('../middleware/roleCheck');
const { getProfile, saveProfile, getAllProfilesWithTeamCounts } = require('../controllers/startupProfileController');

const router = express.Router();

// Protected endpoints: require JWT
router.get('/', requireAuth, getProfile);
router.post('/', requireAuth, saveProfile); // create or update

// List all startup profiles (lightweight) with team member counts
// Restrict list endpoint to investors (read-only aggregation)
router.get('/all', requireAuth, requireRole(['investor']), getAllProfilesWithTeamCounts);

module.exports = router;
