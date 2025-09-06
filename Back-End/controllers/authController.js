import jwt from "jsonwebtoken";

export const loginUser = (db) => (req, res) => {
  const { name, email, password } = req.body;

  if ((!name && !email) || !password) {
    return res.status(400).json({ message: "Name or Email and password required" });
  }

  // Build query dynamically
  const query = name
    ? "SELECT * FROM users WHERE name = ?"
    : "SELECT * FROM users WHERE email = ?";
  const value = name ? name : email;

  db.query(query, [value], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "DB error", error: err.message });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = results[0];

    // For now: plain text compare (later bcrypt)
    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, userType: user.userType },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        userType: user.userType
      }
    });
  });
};


export const signupUser = (db) => (req, res) => {
  const { name, email, password, userType } = req.body;

  if (!name || !email || !password || !userType) {
    return res.status(400).json({ message: "All fields required" });
  }

  // Check if user already exists
  db.query(
    "SELECT * FROM users WHERE email = ? OR name = ?",
    [email, name],
    (err, results) => {
      if (err) {
        return res.status(500).json({ message: "DB error", error: err.message });
      }

      if (results.length > 0) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Insert new user
      db.query(
        "INSERT INTO users (name, email, password, userType) VALUES (?, ?, ?, ?)",
        [name, email, password, userType],
        (err, result) => {
          if (err) {
            return res.status(500).json({ message: "DB insert error", error: err.message });
          }

          return res.status(201).json({
            message: "User registered successfully",
            user: { id: result.insertId, name, email, userType },
          });
        }
      );
    }
  );
};
