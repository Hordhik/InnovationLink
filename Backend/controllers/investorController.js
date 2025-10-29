// Backend/controllers/investorController.js
const Investor = require('../models/investorModel.js');

/**
 * Get a list of all investors (basic info).
 */
const getAllInvestors = async (req, res) => {
    try {
        if (req.user.userType !== 'startup') {
            return res.status(403).json({ message: 'Forbidden: Only startups can view the investor list.' });
        }
        const investors = await Investor.findAllWithUsername();
        const responseData = investors.map(inv => ({
            id: inv.id,             // Investor profile ID
            user_id: inv.user_id,   // User ID
            username: inv.username, // Username from users table
            // We don't need inv.name here if username is primary display
        }));
        res.status(200).json({ investors: responseData });
    } catch (error) {
        console.error('Error fetching investors:', error);
        res.status(500).json({ message: 'Server error while fetching investors' });
    }
};

// --- NEW FUNCTION ---
/**
 * Get details for a single investor by their profile ID.
 */
const getInvestorById = async (req, res) => {
    try {
        // Startups can view any investor profile
        if (req.user.userType !== 'startup') {
            return res.status(403).json({ message: 'Forbidden: Only startups can view investor profiles.' });
        }

        const investorProfileId = parseInt(req.params.id, 10); // Get ID from URL parameter
        if (isNaN(investorProfileId)) {
            return res.status(400).json({ message: 'Invalid investor ID format.' });
        }

        const investorDetails = await Investor.findByIdWithDetails(investorProfileId);

        if (!investorDetails) {
            return res.status(404).json({ message: 'Investor profile not found.' });
        }

        res.status(200).json({ investor: investorDetails });

    } catch (error) {
        console.error(`Error fetching investor by ID ${req.params.id}:`, error);
        res.status(500).json({ message: 'Server error while fetching investor details' });
    }
};


module.exports = {
    getAllInvestors,
    getInvestorById, // Export the new function
};

