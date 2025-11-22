const db = require("../config/db");

const User = {
  async init() {
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userType ENUM('investor', 'startup', 'admin') NOT NULL,
        username VARCHAR(100) NOT NULL UNIQUE,
        email VARCHAR(150) NOT NULL UNIQUE,
        phone VARCHAR(20),
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
  },

  async create(user) {
    const [result] = await db.query(
      "INSERT INTO users (userType, username, email, phone, password) VALUES (?, ?, ?, ?, ?)",
      [user.userType, user.username, user.email, user.phone, user.password]
    );
    return result.insertId;
  },

  async findByEmail(email) {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    return rows[0];
  },

  async findByUsername(username) {
    // Fixed: column is 'username', not 'name'
    // Support both possible schemas: 'username' primary, fallback to legacy 'name'
    if (!username) return undefined;
    // Primary lookup
    const [uRows] = await db.query("SELECT * FROM users WHERE username = ?", [username]);
    if (uRows[0]) return uRows[0];
    // Legacy / alternate column name fallback
    try {
      const [nRows] = await db.query("SELECT * FROM users WHERE name = ?", [username]);
      if (nRows[0]) return nRows[0];
    } catch (e) {
      // Ignore if 'name' column does not exist
    }
    // Case-insensitive fallback (username)
    try {
      const [ciRows] = await db.query("SELECT * FROM users WHERE LOWER(username) = LOWER(?)", [username]);
      if (ciRows[0]) return ciRows[0];
    } catch (e) { }
    // Case-insensitive fallback (name)
    try {
      const [ciNameRows] = await db.query("SELECT * FROM users WHERE LOWER(name) = LOWER(?)", [username]);
      if (ciNameRows[0]) return ciNameRows[0];
    } catch (e) { }
    return undefined;
  },


  async findById(id) {
    const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [id]);
    return rows[0];
  },

  async findByEmailExcluding(email, excludeId) {
    const [rows] = await db.query(
      "SELECT * FROM users WHERE email = ? AND id <> ?",
      [email, excludeId]
    );
    return rows[0];
  },

  async updateById(id, fields = {}) {
    const allowedKeys = ['email', 'phone'];
    const updates = [];
    const values = [];

    for (const key of allowedKeys) {
      if (Object.prototype.hasOwnProperty.call(fields, key) && fields[key] !== undefined) {
        updates.push(`${key} = ?`);
        values.push(fields[key]);
      }
    }

    if (!updates.length) {
      return this.findById(id);
    }

    const sql = `UPDATE users SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    await db.query(sql, [...values, id]);
    return this.findById(id);
  }
};

module.exports = User;
