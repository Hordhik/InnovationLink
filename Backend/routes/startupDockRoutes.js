const express = require('express');
const router = express.Router();
const {
    getMyDock,
    uploadFile,
    getFileData,
    getPublicFileData,
    deleteFile,
    setPrimaryFile,
} = require('../controllers/startupDockController.js');

// Import your auth middleware
const requireAuth = require('../middleware/auth.js');

// Protect all routes
router.use(requireAuth);

// Get all file metadata for the logged-in user's dock
router.get('/me', getMyDock);

// Upload a new file
router.post('/upload', uploadFile);

// Get raw file data for a specific file (for viewing/download)
router.get('/files/:file_id/data', getFileData);

// Get raw file data for a specific PRIMARY file of a given startup (public/investor access)
router.get('/public/:username/files/:file_id/data', getPublicFileData);

// Delete a file
router.delete('/files/:file_id', deleteFile);

// Set a file as primary for its category
router.post('/files/:file_id/set-primary', setPrimaryFile);

module.exports = router;
