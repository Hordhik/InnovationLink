const db = require("../config/db");

const Connection = {
  async init() {
    if (process.env.RESET_CONNECTIONS_NOTIFICATIONS === 'true') {
      try {
        await db.query('DROP TABLE IF EXISTS connections');
      } catch (e) {
        // ignore
      }
    }

    await db.query(`
      CREATE TABLE IF NOT EXISTS connections (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sender_id INT NOT NULL,
        receiver_id INT NOT NULL,
        status ENUM('pending', 'accepted', 'rejected', 'blocked') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_connection (sender_id, receiver_id),
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log("✅ connections table ready");
  },

  async create(senderId, receiverId) {
    // Check if reverse connection exists (e.g. if B blocked A, A shouldn't be able to request B)
    // For simplicity, we just check if a record exists for this pair in this direction.
    // The controller should handle logic about checking if already connected or blocked.
    const [result] = await db.query(
      "INSERT INTO connections (sender_id, receiver_id, status) VALUES (?, ?, 'pending')",
      [senderId, receiverId]
    );
    return result.insertId;
  },

  async findByUsers(user1Id, user2Id) {
    // Check for connection in either direction
    const [rows] = await db.query(
      "SELECT * FROM connections WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)",
      [user1Id, user2Id, user2Id, user1Id]
    );
    return rows[0];
  },

  async findExact(senderId, receiverId) {
    const [rows] = await db.query(
      "SELECT * FROM connections WHERE sender_id = ? AND receiver_id = ?",
      [senderId, receiverId]
    );
    return rows[0];
  },

  async updateStatus(id, status) {
    await db.query("UPDATE connections SET status = ? WHERE id = ?", [status, id]);
  },

  async resetToPending(id, senderId, receiverId) {
    await db.query(
      "UPDATE connections SET sender_id = ?, receiver_id = ?, status = 'pending' WHERE id = ?",
      [senderId, receiverId, id]
    );
  },

  async getConnections(userId) {
    // Get all accepted connections where user is sender OR receiver
    const [rows] = await db.query(`
      SELECT 
        c.id as connection_id,
        c.status,
        u.id as user_id,
        u.username,
        u.userType,
        u.email,
        CASE 
          WHEN u.userType = 'investor' THEN i.name 
          WHEN u.userType = 'startup' THEN sp.company_name 
        END as display_name,
        CASE 
          WHEN u.userType = 'investor' THEN i.profile_image 
          WHEN u.userType = 'startup' THEN sp.logo 
        END as image,
        CASE 
          WHEN u.userType = 'startup' THEN sp.logo_mime 
        END as image_mime
      FROM connections c
      JOIN users u ON (c.sender_id = u.id OR c.receiver_id = u.id)
      LEFT JOIN investors i ON u.id = i.user_id
      LEFT JOIN startup_profile_details sp ON u.username = sp.username
      WHERE (c.sender_id = ? OR c.receiver_id = ?) 
        AND c.status = 'accepted'
        AND u.id != ?
    `, [userId, userId, userId]);
    return rows;
  },

  async getPendingRequests(userId) {
    // Get requests sent TO this user
    const [rows] = await db.query(`
      SELECT 
        c.id as connection_id,
        c.sender_id,
        c.created_at,
        u.username,
        u.userType,
        CASE 
          WHEN u.userType = 'investor' THEN i.name 
          WHEN u.userType = 'startup' THEN sp.company_name 
        END as display_name,
        CASE 
          WHEN u.userType = 'investor' THEN i.profile_image 
          WHEN u.userType = 'startup' THEN sp.logo 
        END as image
      FROM connections c
      JOIN users u ON c.sender_id = u.id
      LEFT JOIN investors i ON u.id = i.user_id
      LEFT JOIN startup_profile_details sp ON u.username = sp.username
      WHERE c.receiver_id = ? AND c.status = 'pending'
    `, [userId]);
    return rows;
  },

  async deleteConnection(id) {
    await db.query("DELETE FROM connections WHERE id = ?", [id]);
  }
};

module.exports = Connection;
