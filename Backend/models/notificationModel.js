const db = require("../config/db");

const Notification = {
    async init() {
        await db.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL, -- Receiver
        sender_id INT, -- Triggerer (optional)
        type VARCHAR(50) NOT NULL, -- e.g., 'connection_request', 'connection_accepted'
        message TEXT,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
        console.log("✅ notifications table ready");
    },

    async create({ userId, senderId, type, message }) {
        await db.query(
            "INSERT INTO notifications (user_id, sender_id, type, message) VALUES (?, ?, ?, ?)",
            [userId, senderId, type, message]
        );
    },

    async getByUser(userId) {
        const [rows] = await db.query(`
            SELECT 
                n.*,
                c.status as connection_status,
                u.username as sender_username,
                u.userType as sender_userType,
                CASE 
                    WHEN u.userType = 'investor' THEN i.name 
                    WHEN u.userType = 'startup' THEN sp.company_name 
                END as sender_display_name
            FROM notifications n
            LEFT JOIN connections c ON (
                (c.sender_id = n.sender_id AND c.receiver_id = n.user_id) OR
                (c.sender_id = n.user_id AND c.receiver_id = n.sender_id)
            )
            LEFT JOIN users u ON n.sender_id = u.id
            LEFT JOIN investors i ON u.id = i.user_id
            LEFT JOIN startup_profile_details sp ON u.username = sp.username
            WHERE n.user_id = ? 
            ORDER BY n.created_at DESC 
            LIMIT 50
        `, [userId]);
        return rows;
    },

    async markAsRead(id, userId) {
        await db.query(
            "UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?",
            [id, userId]
        );
    },

    async markAsUnread(id, userId) {
        await db.query(
            "UPDATE notifications SET is_read = FALSE WHERE id = ? AND user_id = ?",
            [id, userId]
        );
    },

    async markAllAsRead(userId) {
        await db.query(
            "UPDATE notifications SET is_read = TRUE WHERE user_id = ?",
            [userId]
        );
    }
};

module.exports = Notification;
