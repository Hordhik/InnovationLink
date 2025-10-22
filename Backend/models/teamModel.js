const db = require('../config/db');

const Team = {
    async init() {
        await db.query(`
      CREATE TABLE IF NOT EXISTS team_members (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
    username VARCHAR(150) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
        photo LONGBLOB,
        photo_mime VARCHAR(100),
        name VARCHAR(255) NOT NULL,
        designation VARCHAR(255),
        equity VARCHAR(50),
        past_experiences TEXT,
        study VARCHAR(255),
        about TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
        // Best-effort schema alignment for existing installations
        try {
            await db.query('ALTER TABLE team_members MODIFY COLUMN photo LONGBLOB NULL');
        } catch (e) { /* ignore if already correct */ }
        try {
            await db.query('ALTER TABLE team_members MODIFY COLUMN photo_mime VARCHAR(100) NULL');
        } catch (e) { /* ignore if already correct */ }
        // remove founder_name if it exists (schema rollback to requested design)
        try {
            await db.query("ALTER TABLE team_members DROP COLUMN founder_name");
        } catch (e) { /* ignore if not exists */ }
        try {
            await db.query('CREATE INDEX IF NOT EXISTS idx_team_username ON team_members(username)');
        } catch (e) { /* MySQL prior to 8 doesn’t support IF NOT EXISTS for indexes; ignore */ }
    },

    async create(member) {
        const [result] = await db.query(
            `INSERT INTO team_members (user_id, username, company_name, photo, photo_mime, name, designation, equity, past_experiences, study, about) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                member.user_id,
                member.username,
                member.company_name,
                member.photo || null,
                member.photo_mime || null,
                member.name,
                member.designation || null,
                member.equity || null,
                member.past_experiences || null,
                member.study || null,
                member.about || null,
            ]
        );
        return result.insertId;
    },

    async findByUsername(username) {
        const [rows] = await db.query('SELECT * FROM team_members WHERE username = ?', [username]);
        return rows;
    }

    ,
    async findAll() {
        const [rows] = await db.query('SELECT * FROM team_members');
        return rows;
    },

    async findById(id) {
        const [rows] = await db.query('SELECT * FROM team_members WHERE id = ?', [id]);
        return rows[0];
    },

    async findByName(name) {
        // case-insensitive search
        const [rows] = await db.query('SELECT * FROM team_members WHERE LOWER(name) = LOWER(?)', [name]);
        return rows;
    },

    async findByCompanyName(companyName) {
        const [rows] = await db.query('SELECT * FROM team_members WHERE company_name = ?', [companyName]);
        return rows;
    }
};

module.exports = Team;
