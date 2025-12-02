// Backend/models/postModel.js

const db = require('../config/db');

const Post = {
    // Safely parse tags from DB (can be JSON array, plain string, comma-separated, or null)
    _parseTags(raw) {
        if (!raw) return [];
        if (Array.isArray(raw)) return raw; // already parsed by driver
        if (typeof raw === 'object') {
            try {
                // Some drivers may return a Buffer or object-like JSON
                return JSON.parse(raw.toString());
            } catch {
                return [];
            }
        }
        if (typeof raw === 'string') {
            const str = raw.trim();
            // Try strict JSON first
            try {
                const parsed = JSON.parse(str);
                return Array.isArray(parsed) ? parsed : (parsed ? [String(parsed)] : []);
            } catch {
                // Fallbacks: comma-separated or single token
                if (str.includes(',')) {
                    return str.split(',').map(s => s.trim()).filter(Boolean);
                }
                // Single tag string e.g., "startups"
                return str ? [str] : [];
            }
        }
        return [];
    },

    async init() {
        // Create base table if needed, WITHOUT the images column
        await db.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        username VARCHAR(255) NOT NULL,
        userType ENUM('startup', 'investor') NOT NULL,
        title VARCHAR(255),
        content LONGTEXT, -- Use LONGTEXT for potentially large HTML content with images
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
        console.log('Checked/Created base posts table (no separate images column).');

        // --- Idempotently add subtitle and tags columns ---
        try {
            await db.query("ALTER TABLE posts ADD COLUMN subtitle VARCHAR(500)");
            console.log("✅ Successfully added 'subtitle' column to posts table.");
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log("✅ Column 'subtitle' already exists.");
            } else {
                console.error("❌❌ DATABASE SCHEMA ERROR: Failed to add 'subtitle' column:", e.message);
            }
        }
        try {
            await db.query("ALTER TABLE posts ADD COLUMN tags JSON");
            console.log("✅ Successfully added 'tags' column to posts table.");
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log("✅ Column 'tags' already exists.");
            } else {
                console.error("❌❌ DATABASE SCHEMA ERROR: Failed to add 'tags' column:", e.message);
            }
        }
        // --- Ensure 'content' column is LONGTEXT ---
        try {
            // Modify column type if it exists but isn't LONGTEXT
            await db.query("ALTER TABLE posts MODIFY COLUMN content LONGTEXT");
            console.log("✅ Ensured 'content' column type is LONGTEXT.");
        } catch (e) {
            // Handle cases where MODIFY might fail (e.g., column doesn't exist yet - unlikely here)
            console.error("❌❌ DATABASE SCHEMA WARNING: Could not ensure 'content' is LONGTEXT:", e.message);
        }
        // --- Optionally remove the old images column if it exists ---
        try {
            await db.query("ALTER TABLE posts DROP COLUMN images");
            console.log("🗑️ Successfully removed obsolete 'images' column from posts table.");
        } catch (e) {
            // Error code 'ER_CANT_DROP_FIELD_OR_KEY' (1091) means the column doesn't exist.
            if (e.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
                console.log("ℹ️ Column 'images' does not exist, no need to remove.");
            } else {
                console.error("❌❌ DATABASE SCHEMA WARNING: Failed to remove 'images' column:", e.message);
            }
        }
        // -----------------------------------------

        console.log('✅ posts table structure check complete.');
    },

    /**
     * Creates a new post. Images are embedded in the 'content' HTML.
     */
    async createPost(user, { title, subtitle, content, tags }) {
        // Convert tags array to a JSON string for storage
        const tagsJson = tags && Array.isArray(tags) && tags.length > 0 ? JSON.stringify(tags) : null;

        console.log('Attempting to insert post (no separate images):', { userId: user.id, username: user.username, userType: user.userType, title, subtitle: subtitle || null, tags: tagsJson });

        const [result] = await db.execute(
            // --- REMOVED 'images' from INSERT ---
            `INSERT INTO posts (user_id, username, userType, title, subtitle, content, tags)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [user.id, user.username, user.userType, title, subtitle || null, content, tagsJson]
        );

        console.log('Post inserted successfully, ID:', result.insertId);
        return result.insertId;
    },

    /**
     * Fetches a single post by its ID.
     */
    async findById(postId) {
        // --- REMOVED 'images' from SELECT (it's part of content) ---
        const [rows] = await db.execute(
            `SELECT id, user_id, username, userType, title, subtitle, content, tags, created_at
             FROM posts WHERE id = ?`,
            [postId]
        );
        if (rows.length === 0) return null;

        // Parse tags from JSON string back to an array, handle potential null
        return {
            ...rows[0],
            tags: Post._parseTags(rows[0].tags),
            // No separate images field to parse
        };
    },

    async getAllPosts() {
        // --- REMOVED 'images' from SELECT ---
        const [rows] = await db.execute(`
            SELECT id, user_id, username, userType, title, subtitle, content, tags, created_at
            FROM posts ORDER BY created_at DESC
        `);
        // Parse tags, no separate images
        return rows.map(post => ({
            ...post,
            tags: Post._parseTags(post.tags),
        }));
    },

    async getMyPosts(userId) {
        // --- REMOVED 'images' from SELECT ---
        const [rows] = await db.execute(
            `SELECT id, user_id, username, userType, title, subtitle, content, tags, created_at
              FROM posts WHERE user_id = ? ORDER BY created_at DESC`,
            [userId]
        );
        // Parse tags, no separate images
        return rows.map(post => ({
            ...post,
            tags: Post._parseTags(post.tags),
        }));
    },

    async getPostsByUserId(userId) {
        // Same as getMyPosts but named generically for public access
        const [rows] = await db.execute(
            `SELECT id, user_id, username, userType, title, subtitle, content, tags, created_at
              FROM posts WHERE user_id = ? ORDER BY created_at DESC`,
            [userId]
        );
        return rows.map(post => ({
            ...post,
            tags: Post._parseTags(post.tags),
        }));
    },

    /**
     * Updates an existing post by its ID.
     * Allows editing of title, subtitle, content, and tags.
     * @param {number} postId - The ID of the post to update.
     * @param {object} updatedData - Fields to update (title, subtitle, content, tags)
     */
    async updatePost(postId, { title, subtitle, content, tags }) {
        // --- LOGGING ---
        console.log(`>>> Post.updatePost called for ID: ${postId}`);

        // Convert tags to JSON string (null if empty)
        const tagsJson = tags && Array.isArray(tags) && tags.length > 0
            ? JSON.stringify(tags)
            : null;

        try {
            // --- LOGGING ---
            console.log(">>> Post.updatePost: Executing UPDATE query...");

            const [result] = await db.execute(
                `UPDATE posts
                 SET title = ?, subtitle = ?, content = ?, tags = ?
                 WHERE id = ?`,
                [title, subtitle || null, content, tagsJson, postId]
            );

            if (result.affectedRows === 0) {
                console.warn(`>>> Post.updatePost: No rows affected. Post ID ${postId} may not exist.`);
                return null;
            }

            // --- LOGGING ---
            console.log(`>>> Post.updatePost: Post ID ${postId} updated successfully.`);
            return result;
        } catch (error) {
            // --- LOGGING ---
            console.error(`>>> Post.updatePost: Database update failed for ID ${postId}:`, error);
            throw error;
        }
    },
    /**
 * Deletes a post by its ID.
 * @param {number} postId - The ID of the post to delete.
 */
    async deletePost(postId) {
        // --- LOGGING ---
        console.log(`>>> Post.deletePost called for ID: ${postId}`);

        try {
            const [result] = await db.execute(`DELETE FROM posts WHERE id = ?`, [postId]);

            if (result.affectedRows === 0) {
                console.warn(`>>> Post.deletePost: No post found for ID ${postId}`);
                return null;
            }

            // --- LOGGING ---
            console.log(`>>> Post.deletePost: Post ID ${postId} deleted successfully.`);
            return result;
        } catch (error) {
            console.error(`>>> Post.deletePost: Database delete failed for ID ${postId}:`, error);
            throw error;
        }
    },
};

module.exports = Post;
