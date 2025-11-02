// Backend/routes/postRoutes.js

const express = require('express');
const router = express.Router();

// Import controller functions
const {
    createPost,
    getAllPosts,
    getMyPosts,
    getPostById,
    updatePost // ✅ Added updatePost controller import
} = require('../controllers/postController.js');

// Import your auth middleware
const requireAuth = require('../middleware/auth.js');

// --- DEFINE ROUTES ---
// Define specific routes BEFORE general parameterized routes.
// Apply middleware individually.

// GET /api/posts (Public)
router.get('/', getAllPosts);

// GET /api/posts/me (Protected)
// --- FIX: Defined *before* /:id and middleware applied directly ---
router.get('/me', requireAuth, getMyPosts);

// POST /api/posts (Protected)
// --- FIX: Middleware applied directly ---
router.post('/', requireAuth, createPost);

// GET /api/posts/:id (Public)
// --- FIX: Defined *after* /me ---
// This will now only match if the path segment is not 'me'
router.get('/:id', getPostById);

// ✅ NEW: PUT /api/posts/:id (Protected)
// --- FIX: Added update route for editing blogs ---
router.put('/:id', requireAuth, updatePost);

// DELETE /api/posts/:id (Protected)
// --- FIX: Added route to delete a post ---
router.delete('/:id', requireAuth, require('../controllers/postController.js').deletePost);


// Export the router
module.exports = router;
