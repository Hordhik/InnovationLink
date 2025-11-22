// Backend/routes/investorRoutes.js
const express = require('express');
const router = express.Router();
const {
    getAllInvestors,
    getInvestorById,
    getMyInvestorProfile,
    upsertMyInvestorProfile,
    getInvestorPublicProfile,
} = require('../controllers/investorController.js');
const requireAuth = require('../middleware/auth.js');
const roleCheck = require('../middleware/roleCheck.js');

// Diagnostic middleware to log incoming investor route requests and whether auth will run
router.use((req, _res, next) => {
    console.log(`[InvestorRoutes] Incoming ${req.method} ${req.originalUrl}`);
    next();
});

// Public route: view investor profile by username (no auth required)
router.get('/public/:username', getInvestorPublicProfile);

// Private routes (explicitly protected with requireAuth to avoid accidental global ordering issues)
router.get('/me', requireAuth, roleCheck('investor'), getMyInvestorProfile);
router.put('/me', requireAuth, roleCheck('investor'), upsertMyInvestorProfile);
router.get('/', requireAuth, roleCheck('startup'), getAllInvestors);
router.get('/:id', requireAuth, roleCheck('startup'), getInvestorById);

// Log registered route paths for diagnostics at load time
console.log('[InvestorRoutes] Registered routes:');
router.stack
    .filter((layer) => layer.route)
    .forEach((layer) => {
        const methods = Object.keys(layer.route.methods).map(m => m.toUpperCase()).join(',');
        console.log(`  ${methods} /api/investors${layer.route.path}`);
    });

module.exports = router;

