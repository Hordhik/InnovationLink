const db = require("../config/db");

const Investor = {
  async init() {
    await db.query(`
      CREATE TABLE IF NOT EXISTS investors (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        name VARCHAR(100) NOT NULL,
        about_me TEXT,
        preferences JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
  },

  async create(investor) {
    const [result] = await db.query(
      "INSERT INTO investors (user_id, name, about_me, preferences) VALUES (?, ?, ?, ?)",
      [investor.user_id, investor.name, investor.about_me, JSON.stringify(investor.preferences)]
    );
    return result.insertId;
  },

  async findByUserId(userId) {
    const [rows] = await db.query("SELECT * FROM investors WHERE user_id = ?", [userId]);
    return rows[0];
  }
};

module.exports = Investor;
