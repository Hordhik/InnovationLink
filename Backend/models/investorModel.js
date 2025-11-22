const db = require("../config/db");

const JSON_FIELDS = ['preferences', 'expertise', 'sectors', 'stages'];

const safeJsonParse = (value, fallback) => {
  if (!value && value !== 0) return fallback;
  try {
    if (typeof value === 'string') {
      return JSON.parse(value);
    }
    return value;
  } catch (error) {
    console.error('Error parsing JSON column in investors table:', error.message);
    return fallback;
  }
};

const serializeArray = (value) => {
  if (!Array.isArray(value)) return null;
  const cleaned = value
    .map((item) => (item ?? '').toString().trim())
    .filter((item) => item.length > 0);
  return cleaned.length ? JSON.stringify(cleaned) : null;
};

const serializeJson = (value) => {
  if (value === undefined || value === null) return null;
  try {
    return JSON.stringify(value);
  } catch (error) {
    console.error('Failed to stringify investor JSON payload:', error.message);
    return null;
  }
};

const normalizeRecord = (payload = {}) => {
  const record = {
    user_id: payload.user_id,
    name: payload.name ?? null,
    about_me: payload.about_me ?? null,
    preferences: payload.preferences ? serializeJson(payload.preferences) : null,
    title: payload.title ?? null,
    location: payload.location ?? null,
    contact_email: payload.contact_email ?? null,
    contact_phone: payload.contact_phone ?? null,
    linkedin_url: payload.linkedin_url ?? null,
    twitter_url: payload.twitter_url ?? null,
    invest_thesis: payload.invest_thesis ?? null,
    expertise: serializeArray(payload.expertise),
    sectors: serializeArray(payload.sectors),
    stages: serializeArray(payload.stages),
    profile_image: payload.profile_image ?? null,
  };

  // Ensure JSON columns default to null when empty arrays were provided
  if (!record.preferences && payload.preferences === null) {
    record.preferences = null;
  }
  return record;
};

const hydrateRow = (row) => {
  if (!row) return null;
  const hydrated = { ...row };

  for (const field of JSON_FIELDS) {
    hydrated[field] = safeJsonParse(hydrated[field], field === 'preferences' ? null : []);
  }

  // Ensure array fields default to []
  hydrated.expertise = Array.isArray(hydrated.expertise) ? hydrated.expertise : [];
  hydrated.sectors = Array.isArray(hydrated.sectors) ? hydrated.sectors : [];
  hydrated.stages = Array.isArray(hydrated.stages) ? hydrated.stages : [];

  return hydrated;
};

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
          title VARCHAR(120),
          location VARCHAR(120),
          contact_email VARCHAR(150),
          contact_phone VARCHAR(30),
          linkedin_url VARCHAR(255),
          twitter_url VARCHAR(255),
          invest_thesis TEXT,
          expertise JSON,
          sectors JSON,
          stages JSON,
          profile_image MEDIUMTEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);
      console.log('✅ investors table ready');
      await this.checkAndAddColumns();
    } catch (error) {
      console.error("Error initializing investors table:", error);
      // Attempt the column sync even if CREATE TABLE failed (likely already exists)
      await this.checkAndAddColumns();
    }
  },

  async checkAndAddColumns() {
    const columns = [
      { name: 'name', type: 'VARCHAR(100)' },
      { name: 'about_me', type: 'TEXT' },
      { name: 'preferences', type: 'JSON' },
      { name: 'title', type: 'VARCHAR(120)' },
      { name: 'location', type: 'VARCHAR(120)' },
      { name: 'contact_email', type: 'VARCHAR(150)' },
      { name: 'contact_phone', type: 'VARCHAR(30)' },
      { name: 'linkedin_url', type: 'VARCHAR(255)' },
      { name: 'twitter_url', type: 'VARCHAR(255)' },
      { name: 'invest_thesis', type: 'TEXT' },
      { name: 'expertise', type: 'JSON' },
      { name: 'sectors', type: 'JSON' },
      { name: 'stages', type: 'JSON' },
      { name: 'profile_image', type: 'MEDIUMTEXT' }
    ];

    for (const column of columns) {
      try {
        await db.query(`ALTER TABLE investors ADD COLUMN ${column.name} ${column.type}`);
        console.log(`✅ Added '${column.name}' column to investors table.`);
      } catch (error) {
        if (error.code !== 'ER_DUP_FIELDNAME') {
          console.error(`Error ensuring column ${column.name}:`, error.message);
        }
      }
    }
  },

  async create(investor) {
    const record = normalizeRecord(investor);
    const columns = Object.keys(record);
    const placeholders = columns.map(() => '?').join(', ');
    const values = columns.map((key) => record[key]);

    const [result] = await db.query(
      `INSERT INTO investors (${columns.join(', ')}) VALUES (${placeholders})`,
      values
    );
    return result.insertId;
  },

  async updateByUserId(userId, payload = {}) {
    const record = normalizeRecord({ ...payload, user_id: userId });
    delete record.user_id;

    const entries = Object.entries(record).filter(([, value]) => value !== undefined);
    if (!entries.length) {
      return this.findByUserId(userId);
    }

    const assignments = entries.map(([key]) => `${key} = ?`).join(', ');
    const values = entries.map(([, value]) => value);
    await db.query(
      `UPDATE investors SET ${assignments}, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?`,
      [...values, userId]
    );
    return this.findByUserId(userId);
  },

  async upsertByUserId(userId, payload = {}) {
    const existing = await this.findByUserId(userId);
    if (existing) {
      await this.updateByUserId(userId, payload);
    } else {
      await this.create({ ...payload, user_id: userId });
    }
    return this.findByUserId(userId);
  },

  async findByUserId(userId) {
    const [rows] = await db.query("SELECT * FROM investors WHERE user_id = ?", [userId]);
    return hydrateRow(rows[0]);
  },

  async findDetailedByUserId(userId) {
    const [rows] = await db.execute(
      `SELECT * FROM investors WHERE user_id = ?`,
      [userId]
    );
    return hydrateRow(rows[0]);
  },

  async findAllWithUsername() {
    const [rows] = await db.execute(`
      SELECT
        i.id,
        i.user_id,
        i.name,
        u.username
      FROM investors i
      JOIN users u ON i.user_id = u.id
      WHERE u.userType = 'investor'
      ORDER BY COALESCE(i.name, u.username)
    `);
    return rows.map((row) => ({
      id: row.id,
      user_id: row.user_id,
      name: row.name,
      username: row.username
    }));
  },

  async findByIdWithDetails(investorProfileId) {
    const [rows] = await db.execute(
      `SELECT * FROM investors WHERE id = ?`,
      [investorProfileId]
    );
    return hydrateRow(rows[0]);
  }
  ,
  async findUserIdByInvestorName(name) {
    if (!name) return null;
    const [rows] = await db.execute(
      `SELECT user_id FROM investors WHERE name = ? LIMIT 1`,
      [name]
    );
    return rows[0]?.user_id || null;
  }
};

module.exports = Investor;

