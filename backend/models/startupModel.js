const db = require("../config/db");

const Startup = {
  async init() {
    await db.query(`
      CREATE TABLE IF NOT EXISTS startups (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
  },

  async create(startup) {
    const [result] = await db.query(
      "INSERT INTO startups (user_id, name) VALUES (?, ?)",
      [startup.user_id, startup.name]
    );
    return result.insertId;
  },

  async findByUserId(userId) {
    const [rows] = await db.query("SELECT * FROM startups WHERE user_id = ?", [userId]);
    return rows[0];
  }
};

module.exports = Startup;
