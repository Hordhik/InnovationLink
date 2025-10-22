const Team = require('../models/teamModel');
const User = require('../models/userModel');

// Normalize DB rows to frontend-friendly shape
function normalizeMembers(members) {
    if (!Array.isArray(members)) return [];
    return members.map(m => {
        const out = { ...m };
        if (out.photo) {
            try {
                out.photo = `data:${out.photo_mime || 'application/octet-stream'};base64,${Buffer.from(out.photo).toString('base64')}`;
            } catch (e) { /* ignore */ }
        }
        if (out.designation && !out.role) out.role = out.designation;
        if (out.past_experiences) {
            try {
                const parsed = JSON.parse(out.past_experiences);
                if (Array.isArray(parsed)) out.experiences = parsed;
            } catch (e) {
                out.experiences = String(out.past_experiences).split(',').map(s => s.trim()).filter(Boolean);
            }
        } else if (!Array.isArray(out.experiences)) {
            out.experiences = [];
        }
        return out;
    });
}

function parseDataUriToBuffer(input) {
    if (!input || typeof input !== 'string') return { buf: null, mime: null };
    const m = input.match(/^data:([^;]+);base64,(.+)$/);
    if (!m) return { buf: null, mime: null };
    try {
        return { buf: Buffer.from(m[2], 'base64'), mime: m[1] };
    } catch {
        return { buf: null, mime: null };
    }
}

// Add a team member for the authenticated user/company
exports.addMember = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        // resolve username from token
        const user = await User.findById(userId);
        const username = user?.username;
        if (!username) return res.status(400).json({ message: 'User has no username' });

        // Get company_name from startup profile tied to this username
        const StartupProfile = require('../models/startupProfileModel');
        const startup = await StartupProfile.findByUsername(username);
        const company_name = startup?.company_name;
        if (!company_name) {
            return res.status(400).json({ message: 'Company profile not found for this user. Please create startup profile first.' });
        }

        const payload = req.body || {};

        const name = (payload.name || '').toString().trim();
        if (!name) return res.status(400).json({ message: 'Member name is required' });

        // parse photo data URI if provided (or leave null)
        const { buf: photoBuf, mime: photoMime } = parseDataUriToBuffer(payload.photo || payload.photoUrl);

        if (process.env.DEBUG_TEAM === '1') {
            try {
                const raw = payload.photo || payload.photoUrl || '';
                const incomingMime = (typeof raw === 'string' && raw.startsWith('data:')) ? raw.split(';')[0].replace('data:', '') : null;
                console.log('[TEAM DEBUG] addMember incoming:', {
                    name,
                    hasPhoto: !!raw,
                    incomingMime,
                    storedMime: photoMime || null,
                    bufLen: photoBuf ? photoBuf.length : 0,
                });
            } catch { /* ignore */ }
        }

        const insertedId = await Team.create({
            user_id: userId,
            username,
            company_name,
            photo: photoBuf,
            photo_mime: photoMime,
            name,
            designation: payload.role || payload.designation || null,
            equity: payload.equity || null,
            past_experiences: Array.isArray(payload.experiences)
                ? JSON.stringify(payload.experiences)
                : (payload.past_experiences || payload.pastExperiences || null),
            study: payload.study || null,
            about: payload.about || null,
        });

        const members = await Team.findByUsername(username);
        res.status(201).json({ message: 'Member added', members: normalizeMembers(members) });
    } catch (err) {
        console.error('AddMember Error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Replace the authenticated user's team with provided list
exports.setMyTeam = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const user = await User.findById(userId);
        const username = user?.username;
        if (!username) return res.status(400).json({ message: 'User has no username' });

        const StartupProfile = require('../models/startupProfileModel');
        const startup = await StartupProfile.findByUsername(username);
        const company_name = startup?.company_name;
        if (!company_name) return res.status(400).json({ message: 'Company profile not found for this user. Please create startup profile first.' });

        const team = Array.isArray(req.body?.team) ? req.body.team : [];

        // Capture existing members (with BLOBs) to preserve photos if not re-sent
        const existingMembers = await Team.findByUsername(username);
        const existingByName = new Map();
        for (const em of existingMembers) {
            const key = (em.name || '').toString().trim().toLowerCase();
            if (key) existingByName.set(key, em);
        }

        // Wipe existing team for this username
        const db = require('../config/db');
        await db.query('DELETE FROM team_members WHERE username = ?', [username]);

        // Insert all members
        for (const member of team) {
            const name = (member?.name || '').toString().trim();
            if (!name) continue;

            // data URI photo or preserve existing
            let { buf: photoBuf, mime: photoMime } = parseDataUriToBuffer(member.photo || member.photoUrl);
            if (!photoBuf) {
                const prev = existingByName.get(name.toLowerCase());
                if (prev && prev.photo) {
                    photoBuf = prev.photo; // Buffer from DB
                    photoMime = prev.photo_mime || photoMime || null;
                }
            }

            if (process.env.DEBUG_TEAM === '1') {
                try {
                    // eslint-disable-next-line no-console
                    console.log('[TEAM DEBUG] member:', name, {
                        hasPhoto: !!(member.photo),
                        incomingMime: (member.photo && typeof member.photo === 'string' && member.photo.split(';')[0].replace('data:', '')) || null,
                        storedMime: photoMime || null,
                        bufLen: photoBuf ? photoBuf.length : 0,
                    });
                } catch { }
            }

            try {
                await Team.create({
                    user_id: userId,
                    username,
                    company_name,
                    photo: photoBuf,
                    photo_mime: photoMime,
                    name,
                    designation: member.role || member.designation || null,
                    equity: member.equity || null,
                    past_experiences: Array.isArray(member.experiences) ? JSON.stringify(member.experiences) : (member.past_experiences || member.pastExperiences || null),
                    study: member.study || null,
                    about: member.about || null,
                });
            } catch (e) {
                // Common cause: MySQL max_allowed_packet too small for image BLOB
                if (photoBuf && photoBuf.length > 0) {
                    console.error('Team image insert failed. BLOB length:', photoBuf.length);
                }
                throw e;
            }
        }

        // Return updated list
        const members = await Team.findByUsername(username);
        res.status(200).json({ message: 'Team updated', members: normalizeMembers(members) });
    } catch (err) {
        console.error('SetMyTeam Error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all team members
exports.getAllMembers = async (req, res) => {
    try {
        const Team = require('../models/teamModel');

        // If authenticated, return team members for that username (preferred behavior)
        const userId = req.user?.id;
        let members;
        if (userId) {
            const user = await User.findById(userId);
            const username = user?.username;
            if (username) {
                members = await Team.findByUsername(username);
            } else {
                // fallback to all if username missing
                members = await Team.findAll();
            }
        } else {
            // no auth present -> return all members
            members = await Team.findAll();
        }

        res.json({ members: normalizeMembers(members) });
    } catch (err) {
        console.error('GetAllMembers Error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get member by id
exports.getMemberById = async (req, res) => {
    try {
        const id = req.params.id;
        const Team = require('../models/teamModel');
        const member = await Team.findById(id);
        if (!member) return res.status(404).json({ message: 'Member not found' });
        res.json({ member: normalizeMembers([member])[0] });
    } catch (err) {
        console.error('GetMemberById Error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get members by name
exports.getMembersByName = async (req, res) => {
    try {
        const name = req.params.name;
        const Team = require('../models/teamModel');
        const members = await Team.findByName(name);
        res.json({ members: normalizeMembers(members) });
    } catch (err) {
        console.error('GetMembersByName Error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get members by username
exports.getMembersByUsername = async (req, res) => {
    try {
        const username = req.params.username;
        const Team = require('../models/teamModel');
        const members = await Team.findByUsername(username);
        res.json({ members: normalizeMembers(members) });
    } catch (err) {
        console.error('GetMembersByUsername Error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get members by company name
exports.getMembersByCompany = async (req, res) => {
    try {
        const company = req.params.company;
        const Team = require('../models/teamModel');
        const members = await Team.findByCompanyName(company);
        res.json({ members: normalizeMembers(members) });
    } catch (err) {
        console.error('GetMembersByCompany Error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get members for the authenticated user (resolve username from JWT)
exports.getMyMembers = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        // resolve username
        const user = await User.findById(userId);
        const username = user?.username;
        if (!username) return res.status(400).json({ message: 'User has no username' });

        const Team = require('../models/teamModel');
        const members = await Team.findByUsername(username);
        res.json({ members: normalizeMembers(members) });
    } catch (err) {
        console.error('GetMyMembers Error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
