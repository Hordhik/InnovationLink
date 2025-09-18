const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const Startup = require('../models/startupModel');
const Investor = require('../models/investorModel');

exports.register = async (req, res) => {
  try {
    const { username, email, phone, password, userType, companyName, aboutMe, preferences } = req.body;

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

    // Add to respective table
    if (userType === 'startup') {
      if (!username) {
        return res.status(400).json({ message: "Startup name required for startup userType" });
      }
      await Startup.create({ user_id: userId, name: username });
    } else if (userType === 'investor') {
      await Investor.create({
        user_id: userId,
        name: companyName || username,
        about_me: aboutMe || '',
        preferences: preferences || {}
      });
    }

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
    const { email, password, userType } = req.body;

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

    // check userType
    if (userType && user.userType !== userType) {
      return res.status(403).json({ message: `User is not a ${userType}` });
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
