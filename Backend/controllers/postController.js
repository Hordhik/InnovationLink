// Backend/controllers/postController.js

const Post = require('../models/postModel.js');

/**
 * Create a new post.
 */
const createPost = async (req, res) => {
    try {
        // req.user is attached by your 'protect' auth middleware
        const user = req.user;

        // req.body contains { title, content, images }
        const postData = req.body;

        if (!postData.title || !postData.content) {
            return res.status(400).json({ message: 'Title and content are required.' });
        }

        // Your Post.createPost model handles image limiting and processing
        const newPostId = await Post.createPost(user, postData);

        res.status(201).json({ message: 'Post created successfully', postId: newPostId });
    } catch (error) {
        console.error('Error creating post:', error);
        // Check for potential packet size errors
        if (error.code === 'ER_NET_PACKET_TOO_LARGE') {
            return res.status(413).json({
                message: 'Post is too large. Try reducing image size or quantity.'
            });
        }
        res.status(500).json({ message: 'Server error while creating post' });
    }
};

/**
 * Get all posts for public feeds or blogs.
 */
const getAllPosts = async (req, res) => {
    try {
        // Your model handles converting the JSON data back to data URIs
        const posts = await Post.getAllPosts();
        res.status(200).json({ posts });
    } catch (error) {
        console.error('Error fetching all posts:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Get all posts for the currently logged-in user.
 */
const getMyPosts = async (req, res) => {
    try {
        // Get the user ID from the 'protect' middleware's token data
        const userId = req.user.id;

        const posts = await Post.getMyPosts(userId);
        res.status(200).json({ posts });
    } catch (error) {
        console.error('Error fetching user\'s posts:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Export all controller functions
module.exports = {
    createPost,
    getAllPosts,
    getMyPosts,
};