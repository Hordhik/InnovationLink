const db = require("../config/db");

const Notification = {
    async init() {
        if (process.env.RESET_CONNECTIONS_NOTIFICATIONS === 'true') {
            try {
                await db.query('DROP TABLE IF EXISTS notifications');
            } catch (e) {
                // ignore
            }
        }

        await db.query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                sender_id INT,
                connection_id INT NULL,
                is_active BOOLEAN DEFAULT TRUE,
                connection_state ENUM('pending','accepted','rejected','cancelled') NULL DEFAULT NULL,
                type VARCHAR(50) NOT NULL,
                message TEXT,
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE SET NULL
            )
        `);
        console.log("✅ notifications table ready");
    },

    async create({ userId, senderId, connectionId = null, type, message, connectionState = null }) {
        await db.query(
            "INSERT INTO notifications (user_id, sender_id, connection_id, connection_state, type, message) VALUES (?, ?, ?, ?, ?, ?)",
            [userId, senderId, connectionId, connectionState, type, message]
        );
    },

    async supersedeActiveConnectionRequests({ userId, senderId }) {
        await db.query(
            "UPDATE notifications SET is_active = FALSE, connection_state = 'cancelled' WHERE user_id = ? AND sender_id = ? AND type = 'connection_request' AND is_active = TRUE AND (connection_state IS NULL OR connection_state = 'pending')",
            [userId, senderId]
        );
    },

    async resolveLatestConnectionRequest({ userId, senderId, state }) {
        await db.query(
            "UPDATE notifications SET is_active = FALSE, connection_state = ? WHERE user_id = ? AND sender_id = ? AND type = 'connection_request' AND is_active = TRUE AND (connection_state IS NULL OR connection_state = 'pending') ORDER BY created_at DESC, id DESC LIMIT 1",
            [state, userId, senderId]
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
            LEFT JOIN connections c ON c.id = COALESCE(
                n.connection_id,
                (
                    SELECT c2.id
                    FROM connections c2
                    WHERE (
                        (c2.sender_id = n.sender_id AND c2.receiver_id = n.user_id)
                        OR
                        (c2.sender_id = n.user_id AND c2.receiver_id = n.sender_id)
                    )
                    ORDER BY c2.updated_at DESC, c2.id DESC
                    LIMIT 1
                )
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
