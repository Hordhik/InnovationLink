const db = require('../config/db');

const StartupProfile = {
    async init() {
        await db.query(`
			CREATE TABLE IF NOT EXISTS startup_profile_details (
				id INT AUTO_INCREMENT PRIMARY KEY,
				user_id INT NOT NULL,
				username VARCHAR(150) NOT NULL,
				company_name VARCHAR(255) NOT NULL,
				logo LONGBLOB,
				logo_mime VARCHAR(100),
				description TEXT,
				tam VARCHAR(100),
				sam VARCHAR(100),
				som VARCHAR(100),
				founder VARCHAR(255),
				address VARCHAR(255),
				phone VARCHAR(50),
				domain VARCHAR(120),
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
				updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
				FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
				UNIQUE KEY unique_user (user_id),
				UNIQUE KEY unique_username (username)
			)
		`);
        // Best-effort add missing columns when table already exists (MySQL 8+ supports IF NOT EXISTS)
        try { await db.query('ALTER TABLE startup_profile_details ADD COLUMN IF NOT EXISTS founder VARCHAR(255)'); } catch (e) { }
        try { await db.query('ALTER TABLE startup_profile_details ADD COLUMN IF NOT EXISTS address VARCHAR(255)'); } catch (e) { }
        try { await db.query('ALTER TABLE startup_profile_details ADD COLUMN IF NOT EXISTS phone VARCHAR(50)'); } catch (e) { }
        try { await db.query('ALTER TABLE startup_profile_details ADD COLUMN IF NOT EXISTS domain VARCHAR(120)'); } catch (e) { }
    },

    async create(profile) {
        const [result] = await db.query(
            `INSERT INTO startup_profile_details (user_id, username, company_name, logo, logo_mime, description, tam, sam, som, founder, address, phone, domain)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                profile.user_id,
                profile.username,
                profile.company_name,
                profile.logo || null,
                profile.logo_mime || null,
                profile.description || null,
                profile.tam || null,
                profile.sam || null,
                profile.som || null,
                profile.founder || null,
                profile.address || null,
                profile.phone || null,
                profile.domain || null,
            ]
        );
        return result.insertId;
    },

    async findByUserId(userId) {
        const [rows] = await db.query('SELECT * FROM startup_profile_details WHERE user_id = ?', [userId]);
        return rows[0];
    },

    async findByUsername(username) {
        const [rows] = await db.query('SELECT * FROM startup_profile_details WHERE username = ?', [username]);
        return rows[0];
    },

    async updateByUserId(userId, fields) {
        const setParts = [];
        const values = [];
        for (const key of ['company_name', 'logo', 'logo_mime', 'description', 'tam', 'sam', 'som', 'founder', 'address', 'phone', 'domain']) {
            if (Object.prototype.hasOwnProperty.call(fields, key)) {
                setParts.push(`${key} = ?`);
                values.push(fields[key]);
            }
        }
        if (!setParts.length) return false;
        values.push(userId);
        const sql = `UPDATE startup_profile_details SET ${setParts.join(', ')} WHERE user_id = ?`;
        const [result] = await db.query(sql, values);
        return result.affectedRows > 0;
    },

    async updateByUsername(username, fields) {
        const setParts = [];
        const values = [];
        for (const key of ['company_name', 'logo', 'logo_mime', 'description', 'tam', 'sam', 'som', 'founder', 'address', 'phone', 'domain']) {
            if (Object.prototype.hasOwnProperty.call(fields, key)) {
                setParts.push(`${key} = ?`);
                values.push(fields[key]);
            }
        }
        if (!setParts.length) return false;
        values.push(username);
        const sql = `UPDATE startup_profile_details SET ${setParts.join(', ')} WHERE username = ?`;
        const [result] = await db.query(sql, values);
        return result.affectedRows > 0;
    }
};

module.exports = StartupProfile;

