export default function createUserTable(db) {
  const sql = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(150) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      userType ENUM('startup','investor') NOT NULL
    )
  `;
  db.query(sql, (err) => {
    if (err) {
      console.error("❌ Error creating users table:", err.message);
    } else {
      console.log("✅ Users table ready");
    }
  });
}
