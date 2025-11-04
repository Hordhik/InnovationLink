// Backend/controllers/investorController.js
const Investor = require('../models/investorModel.js');
const User = require('../models/userModel.js');

const sanitizeText = (value, max = 255) => {
    if (value === undefined || value === null) return '';
    const trimmed = value.toString().trim();
    return trimmed.length > max ? trimmed.slice(0, max) : trimmed;
};

const sanitizeEmail = (value) => {
    const email = sanitizeText(value, 150);
    if (!email) return '';
    return email.toLowerCase();
};

const sanitizePhone = (value) => {
    if (value === undefined || value === null) return '';
    return value.toString().trim().slice(0, 30);
};

const sanitizeUrl = (value) => {
    const url = sanitizeText(value, 255);
    if (!url) return '';
    return url;
};

const sanitizeArray = (value, maxItems = 20, itemMax = 120) => {
    if (!Array.isArray(value)) return [];
    const seen = new Set();
    const result = [];
    for (const item of value) {
        const cleaned = sanitizeText(item, itemMax);
        if (cleaned && !seen.has(cleaned)) {
            seen.add(cleaned);
            result.push(cleaned);
        }
        if (result.length >= maxItems) break;
    }
    return result;
};

const formatInvestorProfile = (investorRow, userRow, { includeAccountFields = false } = {}) => {
    if (!userRow) return null;
    const profile = {
        id: investorRow?.id ?? null,
        userId: userRow.id,
        username: userRow.username,
        name: investorRow?.name ?? userRow.username,
        title: investorRow?.title ?? '',
        location: investorRow?.location ?? '',
        about: investorRow?.about_me ?? '',
        investLike: investorRow?.invest_thesis ?? (investorRow?.preferences?.investLike || ''),
        expertise: investorRow?.expertise ?? investorRow?.preferences?.expertise ?? [],
        sectors: investorRow?.sectors ?? investorRow?.preferences?.sectors ?? [],
        stages: investorRow?.stages ?? investorRow?.preferences?.stages ?? [],
        image: investorRow?.profile_image ?? '',
        linkedin: investorRow?.linkedin_url ?? '',
        twitter: investorRow?.twitter_url ?? '',
        contactEmail: investorRow?.contact_email ?? userRow.email ?? '',
        contactPhone: investorRow?.contact_phone ?? userRow.phone ?? '',
    };

    profile.email = profile.contactEmail;
    profile.phone = profile.contactPhone;
    profile.accountEmail = userRow.email ?? '';
    profile.accountPhone = userRow.phone ?? '';

    if (!includeAccountFields) {
        delete profile.accountEmail;
        delete profile.accountPhone;
    }

    return profile;
};

/**
 * Get a list of all investors (basic info).
 */
const getAllInvestors = async (req, res) => {
    try {
        if (req.user.userType !== 'startup') {
            return res.status(403).json({ message: 'Forbidden: Only startups can view the investor list.' });
        }
        const investors = await Investor.findAllWithUsername();
        const responseData = investors.map((inv) => ({
            id: inv.id,
            user_id: inv.user_id,
            username: inv.username,
            name: inv.name || inv.username,
        }));
        res.status(200).json({ investors: responseData });
    } catch (error) {
        console.error('Error fetching investors:', error);
        res.status(500).json({ message: 'Server error while fetching investors' });
    }
};

/**
 * Fetch the current investor's profile details.
 */
const getMyInvestorProfile = async (req, res) => {
    try {
        if (req.user.userType !== 'investor') {
            return res.status(403).json({ message: 'Forbidden: Only investors can access their profile.' });
        }

        const userId = req.user.id;
        const [user, investor] = await Promise.all([
            User.findById(userId),
            Investor.findDetailedByUserId(userId),
        ]);

        if (!user) {
            return res.status(404).json({ message: 'User record not found.' });
        }

        const profile = formatInvestorProfile(investor, user, { includeAccountFields: true });
        res.status(200).json({ investor: profile });
    } catch (error) {
        console.error('Error fetching investor profile:', error);
        res.status(500).json({ message: 'Server error while fetching investor profile' });
    }
};

/**
 * Update or create the current investor's profile.
 */
const upsertMyInvestorProfile = async (req, res) => {
    try {
        if (req.user.userType !== 'investor') {
            return res.status(403).json({ message: 'Forbidden: Only investors can update their profile.' });
        }

        const userId = req.user.id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User record not found.' });
        }

        const name = sanitizeText(req.body.name, 120);
        const title = sanitizeText(req.body.title, 140);
        const location = sanitizeText(req.body.location, 140);
        const about = sanitizeText(req.body.about, 4000);
        const investLike = sanitizeText(req.body.investLike, 4000);
        const contactEmail = sanitizeEmail(req.body.email || req.body.contactEmail);
        const contactPhone = sanitizePhone(req.body.phone || req.body.contactPhone);
        const linkedin = sanitizeUrl(req.body.linkedin);
        const twitter = sanitizeUrl(req.body.twitter);
        const expertise = sanitizeArray(req.body.expertise, 25, 100);
        const sectors = sanitizeArray(req.body.sectors, 30, 80);
        const stages = sanitizeArray(req.body.stages, 20, 60);
        const image = req.body.image ? req.body.image.toString() : '';

        if (image && image.length > 5_000_000) {
            return res.status(400).json({ message: 'Profile image is too large. Please upload a smaller image.' });
        }

        if (contactEmail && !contactEmail.includes('@')) {
            return res.status(400).json({ message: 'Please provide a valid email address.' });
        }

        // Update account email if changed and unique
        let updatedUser = user;
        if (contactEmail && contactEmail !== user.email) {
            const existing = await User.findByEmailExcluding(contactEmail, user.id);
            if (existing) {
                return res.status(400).json({ message: 'Email is already in use by another account.' });
            }
            updatedUser = await User.updateById(user.id, { email: contactEmail });
        }

        // Update account phone if changed
        if (contactPhone && contactPhone !== updatedUser.phone) {
            updatedUser = await User.updateById(user.id, { phone: contactPhone });
        }

        const profilePayload = {
            name: name || updatedUser.username,
            title,
            location,
            about_me: about,
            contact_email: contactEmail || updatedUser.email,
            contact_phone: contactPhone || updatedUser.phone,
            linkedin_url: linkedin,
            twitter_url: twitter,
            invest_thesis: investLike,
            expertise,
            sectors,
            stages,
            profile_image: image || null,
            preferences: {
                expertise,
                sectors,
                stages,
                investLike,
            },
        };

        await Investor.upsertByUserId(userId, profilePayload);

        const [freshUser, freshInvestor] = await Promise.all([
            User.findById(userId),
            Investor.findDetailedByUserId(userId),
        ]);

        const profile = formatInvestorProfile(freshInvestor, freshUser, { includeAccountFields: true });
        res.status(200).json({ message: 'Investor profile updated successfully', investor: profile });
    } catch (error) {
        console.error('Error updating investor profile:', error);
        res.status(500).json({ message: 'Server error while updating investor profile' });
    }
};

/**
 * Get details for a single investor by their profile ID.
 */
const getInvestorById = async (req, res) => {
    try {
        if (req.user.userType !== 'startup') {
            return res.status(403).json({ message: 'Forbidden: Only startups can view investor profiles.' });
        }

        const investorProfileId = parseInt(req.params.id, 10);
        if (Number.isNaN(investorProfileId)) {
            return res.status(400).json({ message: 'Invalid investor ID format.' });
        }

        const investorDetails = await Investor.findByIdWithDetails(investorProfileId);
        if (!investorDetails) {
            return res.status(404).json({ message: 'Investor profile not found.' });
        }

        const user = await User.findById(investorDetails.user_id);
        if (!user) {
            return res.status(404).json({ message: 'Investor user account not found.' });
        }
        const profile = formatInvestorProfile(investorDetails, user, { includeAccountFields: false });
        if (!profile) {
            return res.status(404).json({ message: 'Investor profile is incomplete.' });
        }
        res.status(200).json({ investor: profile });
    } catch (error) {
        console.error(`Error fetching investor by ID ${req.params.id}:`, error);
        res.status(500).json({ message: 'Server error while fetching investor details' });
    }
};


module.exports = {
    getAllInvestors,
    getMyInvestorProfile,
    upsertMyInvestorProfile,
    getInvestorById,
};

