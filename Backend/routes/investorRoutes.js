// Backend/routes/investorRoutes.js
const express = require('express');
const router = express.Router();
const { getAllInvestors, getInvestorById } = require('../controllers/investorController.js'); // Import both
const requireAuth = require('../middleware/auth.js');
const roleCheck = require('../middleware/roleCheck.js');

// Protect all investor routes - only logged-in users can access
router.use(requireAuth);

// GET /api/investors
// Fetches a list of all investor usernames. Accessible only by startups.
router.get('/', roleCheck('startup'), getAllInvestors);

// GET /api/investors/:id
// Fetches details for a specific investor profile. Accessible only by startups.
router.get('/:id', roleCheck('startup'), getInvestorById); // Add the new route

module.exports = router;

