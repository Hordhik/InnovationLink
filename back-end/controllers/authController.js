const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

exports.register = async (req, res) => {
  try {
    const { username, email, phone, password, userType } = req.body;

    // check if email exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user
    const userId = await User.create({
      username,
      email,
      phone,
      password: hashedPassword,
      userType
    });

    res.status(201).json({
      message: "User registered successfully",
      user: { id: userId, username, email, phone, userType }
    });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // sign token
    let token;
    try {
      token = jwt.sign(
        { id: user.id, userType: user.userType },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
    } catch (tokenErr) {
      console.error("JWT Sign Error:", tokenErr);
      return res.status(500).json({ message: "Authentication error" });
    }

    res.json({
      message: "Login successful",
      token,
      user: { id: user.id, username: user.username, email: user.email, userType: user.userType }
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
