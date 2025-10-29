const db = require("../config/db");

const Investor = {
  async init() {
    try {
      await db.query(`
        CREATE TABLE IF NOT EXISTS investors (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL UNIQUE,
          name VARCHAR(100),
          about_me TEXT,
          preferences JSON,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);
      console.log('✅ investors table ready');
      await this.checkAndAddColumns(); // Ensure columns exist
    } catch (error) {
      console.error("Error initializing investors table:", error);
      await this.checkAndAddColumns(); // Attempt adding columns even if CREATE fails
    }
  },

  async checkAndAddColumns() {
    // ... (keep the checkAndAddColumns function as provided before) ...
    const columns = [
      { name: 'name', type: 'VARCHAR(100)' },
      { name: 'about_me', type: 'TEXT' },
      { name: 'preferences', type: 'JSON' },
    ];
    let structureUpToDate = true;
    for (const col of columns) {
      try {
        await db.query(`ALTER TABLE investors ADD COLUMN ${col.name} ${col.type}`);
        console.log(`✅ Added '${col.name}' column to investors table.`);
        structureUpToDate = false; // Structure changed
      } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
          // Column already exists, which is fine
        } else {
          console.error(`Error adding column ${col.name}:`, error);
          structureUpToDate = false; // Assume structure might be inconsistent
        }
      }
    }
    if (structureUpToDate) {
      console.log('✅ investors table structure is up-to-date.');
    } else {
      console.log('✅ investors table structure check complete (changes might have occurred).');
    }
  },


  async create(investor) {
    // ... (keep the create function as provided before) ...
    const name = investor.name || null;
    const about_me = investor.about_me || null;
    const preferences = investor.preferences ? JSON.stringify(investor.preferences) : null;

    const [result] = await db.query(
      "INSERT INTO investors (user_id, name, about_me, preferences) VALUES (?, ?, ?, ?)",
      [investor.user_id, name, about_me, preferences]
    );
    return result.insertId;
  },

  async findByUserId(userId) {
    // ... (keep the findByUserId function as provided before) ...
    const [rows] = await db.query("SELECT * FROM investors WHERE user_id = ?", [userId]);
    if (rows[0] && rows[0].preferences) {
      try {
        rows[0].preferences = JSON.parse(rows[0].preferences);
      } catch (e) {
        console.error("Error parsing investor preferences:", e);
        rows[0].preferences = null;
      }
    }
    return rows[0];
  },

  async findAllWithUsername() {
    // ... (keep the findAllWithUsername function as provided before) ...
    const [rows] = await db.execute(`
      SELECT
        i.id,          -- Investor profile ID
        i.user_id,     -- User ID (FK)
        i.name,        -- Investor's specific name (might be null)
        u.username     -- User's login username
      FROM investors i
      JOIN users u ON i.user_id = u.id
      WHERE u.userType = 'investor'
      ORDER BY u.username
    `);
    return rows;
  },

  // --- NEW FUNCTION ---
  /**
   * Fetches investor details by their investor profile ID (i.id).
   * Joins with users table to get username.
   */
  async findByIdWithDetails(investorProfileId) {
    const [rows] = await db.execute(`
      SELECT
        i.id, i.user_id, i.name, i.about_me, i.preferences,
        u.username
      FROM investors i
      JOIN users u ON i.user_id = u.id
      WHERE i.id = ? AND u.userType = 'investor'
    `, [investorProfileId]);

    if (rows.length === 0) return null;

    const investor = rows[0];
    // Parse preferences
    if (investor.preferences) {
      try {
        investor.preferences = JSON.parse(investor.preferences);
      } catch (e) {
        console.error(`Error parsing preferences for investor ID ${investorProfileId}:`, e);
        investor.preferences = null;
      }
    } else {
      investor.preferences = null; // Ensure it's null if stored JSON is null/invalid
    }

    // *** TODO: Fetch real counts/tags later ***
    // For now, return the basic profile data + username
    return {
      id: investor.id,
      user_id: investor.user_id,
      name: investor.name, // Specific name from investors table
      username: investor.username, // Username from users table
      about_me: investor.about_me,
      preferences: investor.preferences,
      // Add dummy data for fields not yet in DB/fetched
      title: "Investor Title Placeholder",
      mentoredCount: 0,
      investmentsCount: 0,
      thesis: investor.about_me || "Investment thesis placeholder.", // Use about_me if available
      tags: investor.preferences?.tags || ["Placeholder Tag"] // Example: extract tags from preferences
    };
  }
};

module.exports = Investor;

