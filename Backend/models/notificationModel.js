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
        const [rows] = await db.query(
            "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50",
            [userId]
        );
        return rows;
    },

    async markAsRead(id, userId) {
        await db.query(
            "UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?",
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
