//
// FILE: Backend/routes/startupProfileRoutes.js (New File)
//
// This new file defines all routes for /api/startup-profile
//

const express = require('express');
const router = express.Router();
const startupProfileController = require('../controllers/startupProfileController');
const requireAuth = require('../middleware/auth'); // Your existing auth middleware

// --- Routes for the logged-in user (My Profile) ---

// GET /api/startup-profile/
// Gets the profile for the *currently logged-in* startup
router.get('/', requireAuth, startupProfileController.getProfile);

// POST /api/startup-profile/
// Saves/updates the profile for the *currently logged-in* startup
router.post('/', requireAuth, startupProfileController.saveProfile);


// --- Routes for Investors (Public viewing) ---

// GET /api/startup-profile/all
// Gets the list of all startups for the investor dashboard
router.get('/all', requireAuth, startupProfileController.getAllProfilesWithTeamCounts);

// GET /api/startup-profile/:username
// Gets the full, public-facing profile for a specific startup (by username)
// This is the new route for the investor to view a startup's page.
router.get('/:username', requireAuth, startupProfileController.getPublicProfileByUsername);


module.exports = router;