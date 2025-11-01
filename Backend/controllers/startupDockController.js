const StartupDock = require('../models/startupDockModel.js');

// Helper to parse Data URIs (from your teamController)
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

/**
 * Get all dock files for the authenticated user.
 * Returns a lightweight list of files, grouped by category.
 */
exports.getMyDock = async (req, res) => {
    try {
        const username = req.user?.username;
        if (!username) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const files = await StartupDock.findByUsername(username);

        // Group files by category for the frontend
        const groupedFiles = {
            pitch: [],
            demo: [],
            patent: [],
        };

        for (const file of files) {
            if (groupedFiles[file.file_category]) {
                groupedFiles[file.file_category].push({
                    file_id: file.file_id,
                    name: file.file_name,
                    mime: file.file_mime,
                    is_primary: !!file.is_primary, // Convert to boolean
                    created_at: file.created_at,
                });
            }
        }

        res.status(200).json({ files: groupedFiles });
    } catch (err) {
        console.error('GetMyDock Error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Upload a new file to the dock.
 * Enforces the 5-file limit per category.
 */
exports.uploadFile = async (req, res) => {
    try {
        const { id: user_id, username } = req.user;
        const { category, fileName, fileDataURI } = req.body;

        if (!['pitch', 'demo', 'patent'].includes(category)) {
            return res.status(400).json({ message: 'Invalid file category.' });
        }

        // Enforce 5-file limit
        const count = await StartupDock.countByCategory(username, category);
        if (count >= 5) {
            return res.status(400).json({
                message: `Upload limit reached. You can only store 5 files per category.`,
            });
        }

        const { buf: file_data, mime: file_mime } = parseDataUriToBuffer(fileDataURI);

        if (!file_data || !fileName || !file_mime) {
            return res.status(400).json({ message: 'Invalid file data or name.' });
        }

        const fileId = await StartupDock.create({
            user_id,
            username,
            file_category: category,
            file_name: fileName,
            file_data,
            file_mime,
        });

        res.status(201).json({ message: 'File uploaded successfully', fileId });
    } catch (err) {
        console.error('UploadFile Error:', err);
        if (err.code === 'ER_DATA_TOO_LONG') {
            return res.status(413).json({ message: 'File is too large.' });
        }
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Get the raw data for a single file to view/download.
 */
exports.getFileData = async (req, res) => {
    try {
        const { file_id } = req.params;
        const { username } = req.user;

        const file = await StartupDock.findFileById(file_id, username);
        if (!file) {
            return res.status(404).json({ message: 'File not found or access denied.' });
        }

        // Send the raw file data
        res.setHeader('Content-Type', file.file_mime);
        res.setHeader('Content-Disposition', `inline; filename="${file.file_name}"`);
        res.send(file.file_data);
    } catch (err) {
        console.error('GetFileData Error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Get the raw data for a single PRIMARY file of a specific startup username.
 * This allows authenticated viewers (e.g., investors) to access files that the
 * startup has marked as primary in their public profile.
 */
exports.getPublicFileData = async (req, res) => {
    try {
        const { username, file_id } = req.params;

        if (!username || !file_id) {
            return res.status(400).json({ message: 'Username and file id are required.' });
        }

        // Only return if this file belongs to the target username AND is marked primary
        const file = await StartupDock.findPublicPrimaryFileById(username, file_id);
        if (!file) {
            return res.status(404).json({ message: 'File not found, not primary, or access denied.' });
        }

        res.setHeader('Content-Type', file.file_mime);
        res.setHeader('Content-Disposition', `inline; filename="${file.file_name}"`);
        res.send(file.file_data);
    } catch (err) {
        console.error('GetPublicFileData Error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Delete a file from the dock.
 */
exports.deleteFile = async (req, res) => {
    try {
        const { file_id } = req.params;
        const { id: user_id } = req.user;

        const affectedRows = await StartupDock.deleteById(file_id, user_id);
        if (affectedRows === 0) {
            return res.status(404).json({ message: 'File not found or access denied.' });
        }

        res.status(200).json({ message: 'File deleted successfully.' });
    } catch (err) {
        console.error('DeleteFile Error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Set a file as the primary one for its category.
 */
exports.setPrimaryFile = async (req, res) => {
    try {
        const { file_id } = req.params;
        const { category } = req.body;
        const { id: user_id } = req.user;

        if (!['pitch', 'demo', 'patent'].includes(category)) {
            return res.status(400).json({ message: 'Invalid file category.' });
        }

        await StartupDock.setPrimary(file_id, user_id, category);
        res.status(200).json({ message: 'Primary file updated.' });
    } catch (err) {
        console.error('SetPrimaryFile Error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
