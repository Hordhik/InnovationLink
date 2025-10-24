// Backend/models/postModel.js

const db = require('../config/db');

// --- Helper function for safely parsing images ---
function parseImages(imagesJson) {
    try {
        // Try to parse the stored value
        const parsed = JSON.parse(imagesJson);
        // If it's a valid array, map over it
        if (Array.isArray(parsed)) {
            return parsed.map(i => `data:${i.mime};base64,${i.data}`);
        }
    } catch (e) {
        // If parsing fails (e.g., it's null, "", or "null"),
        // fall through and return an empty array
    }
    // Default return for null, undefined, or invalid JSON
    return [];
}
// -------------------------------------------------

const Post = {
    async init() {
        await db.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        username VARCHAR(255) NOT NULL,
        userType ENUM('startup', 'investor') NOT NULL,
        title VARCHAR(255),
        content TEXT,
        images JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
        console.log('✅ posts table ready');
    },

    async createPost(user, { title, content, images }) {
        const imageArray = images?.slice(0, 5).map(img => {
            if (!img.startsWith('data:')) return null;
            const [meta, base64Data] = img.split(',');
            const mime = meta.match(/data:(.*);base64/)[1];
            const buffer = Buffer.from(base64Data, 'base64');
            return { data: buffer.toString('base64'), mime };
        }).filter(Boolean);

        const [result] = await db.execute(
            `INSERT INTO posts (user_id, username, userType, title, content, images)
       VALUES (?, ?, ?, ?, ?, ?)`,
            // Use JSON.stringify here or null if the array is empty
            [user.id, user.username, user.userType, title, content, imageArray.length ? JSON.stringify(imageArray) : null]
        );

        return result.insertId;
    },

    async getAllPosts() {
        const [rows] = await db.execute(`SELECT * FROM posts ORDER BY created_at DESC`);
        // Use the safe helper function
        return rows.map(post => ({
            ...post,
            images: parseImages(post.images),
        }));
    },

    async getMyPosts(userId) {
        const [rows] = await db.execute(
            `SELECT * FROM posts WHERE user_id = ? ORDER BY created_at DESC`,
            [userId]
        );
        // Use the safe helper function
        return rows.map(post => ({
            ...post,
            images: parseImages(post.images),
        }));
    }
};

module.exports = Post;