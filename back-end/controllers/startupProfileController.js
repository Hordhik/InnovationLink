const StartupProfile = require('../models/startupProfileModel');
const User = require('../models/userModel');

exports.getProfile = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        // resolve username from userId
        const user = await User.findById(userId);
        const username = user?.username;
        if (!username) return res.status(400).json({ message: 'User has no username' });

        const profile = await StartupProfile.findByUsername(username);
        if (!profile) return res.status(404).json({ message: 'Profile not found' });

        // convert binary logo to data URI if present, else use logo_url if available
        if (profile) {
            if (profile.logo) {
                try {
                    const b64 = Buffer.from(profile.logo).toString('base64');
                    profile.logo = `data:${profile.logo_mime || 'application/octet-stream'};base64,${b64}`;
                } catch (e) {
                    // leave as-is
                }
            } else if (profile.logo_url) {
                profile.logo = profile.logo_url;
            }
        }

        // Return profile and basic user info
        const userInfo = { id: user.id, username: user.username, email: user.email, userType: user.userType };
        res.json({ profile, user: userInfo });
    } catch (err) {
        console.error('GetProfile Error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create or update profile
exports.saveProfile = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        // resolve username from userId
        const user = await User.findById(userId);
        const username = user?.username;
        if (!username) return res.status(400).json({ message: 'User has no username' });

        const payload = req.body || {};

        // Minimal validation
        const company_name = (payload.company_name || payload.companyName || '').toString().trim();
        if (!company_name) {
            return res.status(400).json({ message: 'company_name is required' });
        }

        // Check if profile exists by username
        const existing = await StartupProfile.findByUsername(username);
        if (existing) {
            // handle logo data URI/base64 if provided
            let logoBuf = undefined;
            let logoMime = undefined;
            const logoInput = payload.logo || payload.logoUrl;
            if (logoInput && typeof logoInput === 'string' && logoInput.startsWith('data:')) {
                // data:[<mime>][;base64],<data>
                const match = logoInput.match(/^data:(.+);base64,(.+)$/);
                if (match) {
                    logoMime = match[1];
                    logoBuf = Buffer.from(match[2], 'base64');
                }
            }

            const updated = await StartupProfile.updateByUsername(username, {
                company_name,
                // prefer new logo if provided, else keep existing
                ...(logoBuf ? { logo: logoBuf, logo_mime: logoMime } : {}),
                description: payload.description || existing.description,
                tam: payload.tam || existing.tam,
                sam: payload.sam || existing.sam,
                som: payload.som || existing.som,
            });
            if (!updated) return res.status(500).json({ message: 'Failed to update profile' });
            const profile = await StartupProfile.findByUsername(username);
            // convert binary logo to data URI if present
            if (profile && profile.logo) {
                try {
                    const b64 = Buffer.from(profile.logo).toString('base64');
                    profile.logo = `data:${profile.logo_mime || 'application/octet-stream'};base64,${b64}`;
                } catch (e) {
                    // keep as-is if conversion fails
                }
            }
            return res.json({ message: 'Profile updated', profile });
        }

        // create new profile
        // parse incoming logo data URI if provided
        let createLogo = null;
        let createLogoMime = null;
        const logoInput = payload.logo || payload.logoUrl;
        if (logoInput && typeof logoInput === 'string' && logoInput.startsWith('data:')) {
            const match = logoInput.match(/^data:(.+);base64,(.+)$/);
            if (match) {
                createLogoMime = match[1];
                createLogo = Buffer.from(match[2], 'base64');
            }
        }

        const insertedId = await StartupProfile.create({
            user_id: userId,
            username,
            company_name,
            logo: createLogo,
            logo_mime: createLogoMime,
            description: payload.description || null,
            tam: payload.tam || null,
            sam: payload.sam || null,
            som: payload.som || null,
        });
        const profile = await StartupProfile.findByUsername(username);
        // convert binary logo to data URI if present
        if (profile && profile.logo) {
            try {
                const b64 = Buffer.from(profile.logo).toString('base64');
                profile.logo = `data:${profile.logo_mime || 'application/octet-stream'};base64,${b64}`;
            } catch (e) {
                // ignore
            }
        }
        res.status(201).json({ message: 'Profile created', profile });
    } catch (err) {
        console.error('SaveProfile Error:', err);
        // handle duplicate key error gracefully
        if (err && err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Profile already exists' });
        }
        res.status(500).json({ message: 'Server error' });
    }
};
