const db = require('../config/db');

const StartupDock = {
  /**
   * Creates the startup_dock_files table.
   * This table holds all files for all startups, linked by user_id/username.
   */
  async init() {
    await db.query(`
      CREATE TABLE IF NOT EXISTS startup_dock_files (
        file_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        username VARCHAR(150) NOT NULL,
        file_category ENUM('pitch', 'demo', 'patent') NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_data LONGBLOB NOT NULL,
        file_mime VARCHAR(100) NOT NULL,
        is_primary BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE,
        INDEX idx_user_category (username, file_category)
      )
    `);
    console.log('✅ startup_dock_files table ready');
  },

  /**
   * Counts files for a specific user in a specific category.
   * Used to enforce the 5-file limit.
   */
  async countByCategory(username, category) {
    const [rows] = await db.execute(
      'SELECT COUNT(*) as count FROM startup_dock_files WHERE username = ? AND file_category = ?',
      [username, category]
    );
    return rows[0].count;
  },

  /**
   * Creates a new file record.
   */
  async create(fileData) {
    const {
      user_id,
      username,
      file_category,
      file_name,
      file_data,
      file_mime,
    } = fileData;

    const [result] = await db.execute(
      `INSERT INTO startup_dock_files (user_id, username, file_category, file_name, file_data, file_mime, is_primary)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        username,
        file_category,
        file_name,
        file_data,
        file_mime,
        false, // New files are not primary by default
      ]
    );
    return result.insertId;
  },

  /**
   * Finds all files for a user, grouped by category.
   */
  async findByUsername(username) {
    const [rows] = await db.execute(
      'SELECT file_id, file_category, file_name, file_mime, is_primary, created_at FROM startup_dock_files WHERE username = ? ORDER BY file_category, created_at',
      [username]
    );
    // Note: We don't select 'file_data' here to keep this request light.
    // We will create a separate endpoint to get the actual file data for viewing.
    return rows;
  },

  /**
   * Gets the full data for a single file, verifying user ownership.
   */
  async findFileById(file_id, username) {
    const [rows] = await db.execute(
      'SELECT * FROM startup_dock_files WHERE file_id = ? AND username = ?',
      [file_id, username]
    );
    return rows[0];
  },

  /**
   * Gets the full data for a single file for a given startup username,
   * without requiring the caller to be the owner. Intended for public/investor
   * viewing. Restricts to files that are marked primary for safety.
   */
  async findPublicPrimaryFileById(username, file_id) {
    const [rows] = await db.execute(
      'SELECT * FROM startup_dock_files WHERE file_id = ? AND username = ? AND is_primary = TRUE',
      [file_id, username]
    );
    return rows[0];
  },

  /**
   * Deletes a file, verifying user ownership.
   */
  async deleteById(file_id, user_id) {
    const [result] = await db.execute(
      'DELETE FROM startup_dock_files WHERE file_id = ? AND user_id = ?',
      [file_id, user_id]
    );
    return result.affectedRows;
  },

  /**
   * Sets a file as primary for its category.
   * This is a transaction to ensure atomicity.
   */
  async setPrimary(file_id, user_id, category) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // 1. Set all other files in this category to not-primary
      await connection.execute(
        'UPDATE startup_dock_files SET is_primary = FALSE WHERE user_id = ? AND file_category = ?',
        [user_id, category]
      );

      // 2. Set the specified file to primary
      await connection.execute(
        'UPDATE startup_dock_files SET is_primary = TRUE WHERE file_id = ? AND user_id = ?',
        [file_id, user_id]
      );

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },
};

module.exports = StartupDock;
