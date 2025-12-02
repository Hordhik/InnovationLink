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
 * Get all posts for a specific user (public).
 */
const getPostsByUser = async (req, res, next) => {
    console.log(`>>> getPostsByUser controller reached for userID: ${req.params.userId}`);
    try {
        const { userId } = req.params;
        const posts = await Post.getPostsByUserId(userId);
        console.log(`>>> getPostsByUser: Found ${posts.length} posts for user ${userId}.`);
        res.status(200).json({ posts });
    } catch (error) {
        console.error(`>>> getPostsByUser: Error fetching posts for user ${req.params.userId}:`, error);
        next(error);
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

/**
 * Update an existing post by its ID.
 */
const updatePost = async (req, res, next) => {
    // --- LOGGING ---
    console.log(`>>> updatePost controller reached for ID: ${req.params.id}`);
    try {
        const { id } = req.params;
        const user = req.user;
        const { title, subtitle, content, tags } = req.body;

        // --- VALIDATION ---
        if (!title || !content) {
            console.log(">>> updatePost: Missing title or content.");
            return res.status(400).json({ message: "Title and content are required." });
        }

        // --- LOGGING ---
        console.log(`>>> updatePost: Calling Post.findById for verification of ID ${id}`);
        const existingPost = await Post.findById(id);

        if (!existingPost) {
            console.log(`>>> updatePost: Post with ID ${id} not found.`);
            return res.status(404).json({ message: "Post not found." });
        }

        // --- SECURITY CHECK ---
        if (existingPost.user_id !== user.id) {
            console.warn(`>>> updatePost: Unauthorized edit attempt by user ${user.id}.`);
            return res.status(403).json({ message: "You are not authorized to edit this post." });
        }

        // --- LOGGING ---
        console.log(`>>> updatePost: Calling Post.updatePost for ID ${id}`);
        await Post.updatePost(id, { title, subtitle, content, tags });

        // --- SUCCESS ---
        console.log(`>>> updatePost: Post ${id} updated successfully.`);
        res.status(200).json({ message: "Post updated successfully." });
    } catch (error) {
        // --- LOGGING ---
        console.error(`>>> updatePost: Error updating post ${req.params.id}:`, error);
        next(error);
    }
};

/**
 * Delete an existing post by its ID.
 */
const deletePost = async (req, res, next) => {
    // --- LOGGING ---
    console.log(`>>> deletePost controller reached for ID: ${req.params.id}`);
    try {
        const { id } = req.params;
        const user = req.user;

        // --- LOGGING ---
        console.log(`>>> deletePost: Calling Post.findById for verification of ID ${id}`);
        const existingPost = await Post.findById(id);

        if (!existingPost) {
            console.log(`>>> deletePost: Post with ID ${id} not found.`);
            return res.status(404).json({ message: "Post not found." });
        }

        // --- SECURITY CHECK ---
        if (existingPost.user_id !== user.id) {
            console.warn(`>>> deletePost: Unauthorized delete attempt by user ${user.id}.`);
            return res.status(403).json({ message: "You are not authorized to delete this post." });
        }

        // --- LOGGING ---
        console.log(`>>> deletePost: Calling Post.deletePost for ID ${id}`);
        await Post.deletePost(id);

        // --- SUCCESS ---
        console.log(`>>> deletePost: Post ${id} deleted successfully.`);
        res.status(200).json({ message: "Post deleted successfully." });
    } catch (error) {
        // --- LOGGING ---
        console.error(`>>> deletePost: Error deleting post ${req.params.id}:`, error);
        next(error);
    }
};


// Export all controller functions
module.exports = {
    createPost,
    getAllPosts,
    getMyPosts,
    getPostById,
    getPostsByUser, // ✅ Added new export
    updatePost,
    deletePost // ✅ Added new export
};
