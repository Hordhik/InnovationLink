// Backend/routes/postRoutes.js

const express = require('express');
const router = express.Router();

// Import controller functions
const {
    createPost,
    getAllPosts,
    getMyPosts
} = require('../controllers/postController.js');

// Import your auth middleware.
// Based on your screenshot, this is likely 'auth.js'
// If 'auth.js' doesn't export 'protect', check its contents.
// It might be exporting a single middleware function.
const requireAuth = require('../middleware/auth.js');

// --- Protect all post routes ---
router.use(requireAuth);

// POST /api/posts
// Create a new post
router.post('/', createPost);

// GET /api/posts
// Get a list of all posts (e.g., for the main blog/feed)
router.get('/', getAllPosts);

// GET /api/posts/me
// Get only the posts for the logged-in user
router.get('/me', getMyPosts);

// Export the router
module.exports = router;