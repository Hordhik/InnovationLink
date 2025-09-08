import jwt from "jsonwebtoken";

export const loginUser = (db) => (req, res) => {
  const { name, email, password } = req.body;
  const userType = (req.body?.userType || "").toString().trim().toLowerCase();

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

    // Optional role check: only allow if provided userType matches stored role
    if (userType && user.userType && userType !== user.userType) {
      return res.status(401).json({ message: "Role mismatch" });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, userType: user.userType },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Server-driven navigation hint
    const portal = user.userType === 'investor' ? 'I' : 'S'
    const redirectPath = `/${portal}/handbook/home`

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        userType: user.userType
      },
      redirectPath,
    });
  });
};


export const signupUser = (db) => (req, res) => {
  // Normalize inputs
  let { name, email, password, userType } = req.body;
  name = (name || "").toString().trim();
  email = (email || "").toString().trim().toLowerCase();
  password = (password || "").toString().trim();
  userType = (userType || "").toString().trim().toLowerCase();

  const allowedTypes = new Set(["startup", "investor"]);
  if (!name || !email || !password || !userType) {
    return res.status(400).json({ message: "All fields required" });
  }
  if (!allowedTypes.has(userType)) {
    return res.status(400).json({ message: "Invalid userType" });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  // Check if email already exists
  db.query("SELECT 1 FROM users WHERE email = ? LIMIT 1", [email], (err, emailRows) => {
    if (err) {
      return res.status(500).json({ message: "DB error", error: err.message });
    }
    if (emailRows.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Optional: enforce name uniqueness in app layer
    db.query("SELECT 1 FROM users WHERE name = ? LIMIT 1", [name], (err2, nameRows) => {
      if (err2) {
        return res.status(500).json({ message: "DB error", error: err2.message });
      }
      if (nameRows.length > 0) {
        return res.status(400).json({ message: "Name already taken" });
      }

      // Insert new user
      db.query(
        "INSERT INTO users (name, email, password, userType) VALUES (?, ?, ?, ?)",
        [name, email, password, userType],
        (insErr, result) => {
          if (insErr) {
            return res.status(500).json({ message: "DB insert error", error: insErr.message });
          }

          const portal = userType === 'investor' ? 'I' : 'S';
          const redirectPath = `/${portal}/handbook/home`;

          return res.status(201).json({
            message: "User registered successfully",
            user: { id: result.insertId, name, email, userType },
            redirectPath,
          });
        }
      );
    });
  });
};
