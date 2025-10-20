const Team = require('../models/teamModel');
const User = require('../models/userModel');

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

        // parse photo data URI if provided
        let photoBuf = null;
        let photoMime = null;
        const photoInput = payload.photo || payload.photoUrl;
        if (photoInput && typeof photoInput === 'string' && photoInput.startsWith('data:')) {
            const match = photoInput.match(/^data:(.+);base64,(.+)$/);
            if (match) {
                photoMime = match[1];
                photoBuf = Buffer.from(match[2], 'base64');
            }
        }

        const insertedId = await Team.create({
            user_id: userId,
            username,
            company_name,
            photo: photoBuf,
            photo_mime: photoMime,
            name,
            designation: payload.designation || null,
            equity: payload.equity || null,
            past_experiences: payload.past_experiences || payload.pastExperiences || null,
            study: payload.study || null,
            about: payload.about || null,
        });

        const members = await Team.findByUsername(username);
        // convert photos to data URI for response
        for (const m of members) {
            if (m.photo) {
                try {
                    const b64 = Buffer.from(m.photo).toString('base64');
                    m.photo = `data:${m.photo_mime || 'application/octet-stream'};base64,${b64}`;
                } catch (e) { }
            }
        }

        res.status(201).json({ message: 'Member added', members });
    } catch (err) {
        console.error('AddMember Error:', err);
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

        // convert photos
        for (const m of members) {
            if (m.photo) {
                try {
                    m.photo = `data:${m.photo_mime || 'application/octet-stream'};base64,${Buffer.from(m.photo).toString('base64')}`;
                } catch (e) { }
            }
        }
        res.json({ members });
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
        if (member.photo) {
            try {
                member.photo = `data:${member.photo_mime || 'application/octet-stream'};base64,${Buffer.from(member.photo).toString('base64')}`;
            } catch (e) { }
        }
        res.json({ member });
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
        for (const m of members) {
            if (m.photo) {
                try {
                    m.photo = `data:${m.photo_mime || 'application/octet-stream'};base64,${Buffer.from(m.photo).toString('base64')}`;
                } catch (e) { }
            }
        }
        res.json({ members });
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
        for (const m of members) {
            if (m.photo) {
                try {
                    m.photo = `data:${m.photo_mime || 'application/octet-stream'};base64,${Buffer.from(m.photo).toString('base64')}`;
                } catch (e) { }
            }
        }
        res.json({ members });
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
        for (const m of members) {
            if (m.photo) {
                try {
                    m.photo = `data:${m.photo_mime || 'application/octet-stream'};base64,${Buffer.from(m.photo).toString('base64')}`;
                } catch (e) { }
            }
        }
        res.json({ members });
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
        for (const m of members) {
            if (m.photo) {
                try {
                    m.photo = `data:${m.photo_mime || 'application/octet-stream'};base64,${Buffer.from(m.photo).toString('base64')}`;
                } catch (e) { }
            }
        }
        res.json({ members });
    } catch (err) {
        console.error('GetMyMembers Error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
