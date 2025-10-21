const StartupProfile = require('../models/startupProfileModel');
const User = require('../models/userModel');
const Team = require('../models/teamModel');
const db = require('../config/db');

async function ensureFounderMember({ userId, username, company_name, founder }) {
    try {
        const name = (founder || '').toString().trim();
        if (!name) return;
        // Check if founder already exists in team by case-insensitive name
        const existing = await Team.findByUsername(username);
        const has = Array.isArray(existing) && existing.some(m => (m?.name || '').trim().toLowerCase() === name.toLowerCase());
        if (has) return;
        await Team.create({
            user_id: userId,
            username,
            company_name,
            photo: null,
            photo_mime: null,
            name,
            designation: 'Founder',
            equity: null,
            past_experiences: null,
            study: null,
            about: null,
        });
    } catch (e) {
        // don't block profile save on team founder issues
        console.warn('ensureFounderMember warning:', e?.message || e);
    }
}

exports.getProfile = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const user = await User.findById(userId);
        const username = user?.username;
        if (!username) return res.status(400).json({ message: 'User has no username' });

        const profile = await StartupProfile.findByUsername(username);
        if (!profile) return res.status(404).json({ message: 'Profile not found' });

        if (profile.logo) {
            try {
                const b64 = Buffer.from(profile.logo).toString('base64');
                profile.logo = `data:${profile.logo_mime || 'application/octet-stream'};base64,${b64}`;
            } catch { }
        }

        const userInfo = { id: user.id, username: user.username, email: user.email, userType: user.userType };
        res.json({ profile, user: userInfo });
    } catch (err) {
        console.error('GetProfile Error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.saveProfile = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const user = await User.findById(userId);
        const username = user?.username;
        if (!username) return res.status(400).json({ message: 'User has no username' });

        const payload = req.body || {};
        // Map fields from frontend form
        const company_name = (payload.company_name || payload.companyName || payload.startupName || '').toString().trim();
        if (!company_name) return res.status(400).json({ message: 'company_name is required' });
        const founder = (payload.founder || payload.founderName || '').toString().trim() || null;
        const address = (payload.address || '').toString().trim() || null;
        const phone = (payload.phone || '').toString().trim() || null;
        const domain = (payload.domain || '').toString().trim() || null;

        // logo can be data URI base64
        let logoBuf = null;
        let logoMime = null;
        const logoInput = payload.logo || payload.logoUrl;
        if (logoInput && typeof logoInput === 'string' && logoInput.startsWith('data:')) {
            const match = logoInput.match(/^data:(.+);base64,(.+)$/);
            if (match) {
                logoMime = match[1];
                logoBuf = Buffer.from(match[2], 'base64');
            }
        }

        const existing = await StartupProfile.findByUsername(username);
        if (existing) {
            const prevFounder = existing.founder || null;
            const nextFounder = founder ?? existing.founder ?? null;
            const updated = await StartupProfile.updateByUsername(username, {
                company_name,
                ...(logoBuf ? { logo: logoBuf, logo_mime: logoMime } : {}),
                description: payload.description ?? existing.description,
                tam: payload.tam ?? existing.tam,
                sam: payload.sam ?? existing.sam,
                som: payload.som ?? existing.som,
                founder: founder ?? existing.founder,
                address: address ?? existing.address,
                phone: phone ?? existing.phone,
                domain: domain ?? existing.domain,
            });
            if (!updated) return res.status(500).json({ message: 'Failed to update profile' });
            const profile = await StartupProfile.findByUsername(username);
            // Best-effort: ensure founder is listed in team_members
            if (profile?.company_name) {
                await ensureFounderMember({ userId, username, company_name: profile.company_name, founder: profile.founder || founder });
                // If founder name changed, rename the existing team member row too (case-insensitive match)
                if (prevFounder && nextFounder && prevFounder.trim().toLowerCase() !== nextFounder.trim().toLowerCase()) {
                    try {
                        await db.query('UPDATE team_members SET name = ?, designation = COALESCE(designation, ?) WHERE username = ? AND LOWER(name) = LOWER(?)', [
                            nextFounder.trim(),
                            'Founder',
                            username,
                            prevFounder.trim(),
                        ]);
                    } catch (e) {
                        console.warn('Founder rename warning:', e?.message || e);
                    }
                }
            }
            if (profile?.logo) {
                try {
                    const b64 = Buffer.from(profile.logo).toString('base64');
                    profile.logo = `data:${profile.logo_mime || 'application/octet-stream'};base64,${b64}`;
                } catch { }
            }
            return res.json({ message: 'Profile updated', profile });
        }

        const insertedId = await StartupProfile.create({
            user_id: userId,
            username,
            company_name,
            logo: logoBuf,
            logo_mime: logoMime,
            description: payload.description || null,
            tam: payload.tam || null,
            sam: payload.sam || null,
            som: payload.som || null,
            founder,
            address,
            phone,
            domain,
        });
        const profile = await StartupProfile.findByUsername(username);
        // Best-effort: ensure founder is listed in team_members
        if (profile?.company_name) {
            await ensureFounderMember({ userId, username, company_name: profile.company_name, founder: profile.founder || founder });
        }
        if (profile?.logo) {
            try {
                const b64 = Buffer.from(profile.logo).toString('base64');
                profile.logo = `data:${profile.logo_mime || 'application/octet-stream'};base64,${b64}`;
            } catch { }
        }
        res.status(201).json({ message: 'Profile created', profile });
    } catch (err) {
        console.error('SaveProfile Error:', err);
        if (err && err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Profile already exists' });
        }
        res.status(500).json({ message: 'Server error' });
    }
};

