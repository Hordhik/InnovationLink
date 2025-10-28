// Backend/controllers/postController.js

const Post = require('../models/postModel.js');

/**
 * Create a new post.
 */
const createPost = async (req, res, next) => { // Added next for error handling consistency
    // --- LOGGING ---
    console.log(">>> createPost controller reached...");
    try {
        const user = req.user; // Attached by auth middleware

        // Data from frontend: { title, subtitle, content, tags }
        const postData = req.body;

        if (!postData.title || !postData.content) {
            // --- LOGGING ---
            console.log(">>> createPost: Bad Request - Title or content missing.");
            return res.status(400).json({ message: 'Title and content are required.' });
        }

        // --- LOGGING ---
        console.log(">>> createPost: Calling Post.createPost...");
        const newPostId = await Post.createPost(user, postData);
        // --- LOGGING ---
        console.log(">>> createPost: Post created successfully. ID:", newPostId);

        res.status(201).json({ message: 'Post created successfully', postId: newPostId });
    } catch (error) {
        // --- LOGGING ---
        console.error('>>> createPost: Error creating post:', error); // Log the full error
        // Pass error to the central error handler
        next(error); // Use next(error) instead of sending response directly
    }
};

/**
 * Get all posts for public feeds or blogs.
 */
const getAllPosts = async (req, res, next) => { // Added next
    // --- LOGGING ---
    console.log(">>> getAllPosts controller reached...");
    try {
        // --- LOGGING ---
        console.log(">>> getAllPosts: Calling Post.getAllPosts...");
        const posts = await Post.getAllPosts();
        // --- LOGGING ---
        console.log(`>>> getAllPosts: Found ${posts.length} posts.`);
        res.status(200).json({ posts });
    } catch (error) {
        // --- LOGGING ---
        console.error('>>> getAllPosts: Error fetching all posts:', error);
        next(error); // Pass to error handler
    }
};

/**
 * Get all posts for the currently logged-in user.
 */
const getMyPosts = async (req, res, next) => { // Added next
    // --- LOGGING ---
    console.log(">>> getMyPosts controller reached...");
    try {
        const userId = req.user.id;
        // --- LOGGING ---
        console.log(`>>> getMyPosts: Calling Post.getMyPosts for user ID: ${userId}`);
        const posts = await Post.getMyPosts(userId);
        // --- LOGGING ---
        console.log(`>>> getMyPosts: Found ${posts.length} posts for user ${userId}.`);
        res.status(200).json({ posts });
    } catch (error) {
        // --- LOGGING ---
        console.error(`>>> getMyPosts: Error fetching posts for user ${req.user?.id}:`, error);
        next(error); // Pass to error handler
    }
};

/**
 * Get a single post by its ID.
 */
const getPostById = async (req, res, next) => { // Added next
    // --- LOGGING ---
    console.log(`>>> getPostById controller reached for ID: ${req.params.id}`);
    try {
        const { id } = req.params;

        // --- FIX: Check if the ID could be 'me' and handle appropriately ---
        // Although the route order should prevent this, add a safeguard
        if (id === 'me') {
            console.warn(">>> getPostById: Route '/:id' incorrectly matched '/me'. Check router order.");
            // Optionally, you could call getMyPosts if req.user exists, or just return 404/400
            return res.status(400).json({ message: "Invalid request path." });
        }


        // --- LOGGING ---
        console.log(`>>> getPostById: Calling Post.findById for ID: ${id}`);
        const post = await Post.findById(id);

        if (!post) {
            // --- LOGGING ---
            console.log(`>>> getPostById: Post with ID ${id} not found. Returning 404.`);
            return res.status(404).json({ message: 'Post not found' });
        }
        // --- LOGGING ---
        console.log(`>>> getPostById: Found post with ID ${id}.`);
        res.status(200).json({ post });

    } catch (error) {
        // --- LOGGING ---
        console.error(`>>> getPostById: Error fetching post by ID ${req.params.id}:`, error);
        next(error); // Pass to error handler
    }
};

// Export all controller functions
module.exports = {
    createPost,
    getAllPosts,
    getMyPosts,
    getPostById,
};

