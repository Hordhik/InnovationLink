const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const Startup = require('../models/startupModel');
const Investor = require('../models/investorModel');

exports.register = async (req, res) => {
  try {
    const raw = req.body || {};
    // Support legacy payloads that send `name` instead of `username`
    const username = (raw.username ?? raw.name ?? '').toString().trim();
    const email = (raw.email ?? '').toString().trim();
    const phone = (raw.phone ?? '').toString().trim();
    const password = (raw.password ?? '').toString();
    const userType = (raw.userType ?? '').toString().trim();
    const companyName = raw.companyName;
    const aboutMe = raw.aboutMe;
    const preferences = raw.preferences;

    // basic validation with detailed feedback
    const missing = [];
    if (!username) missing.push('username');
    if (!email) missing.push('email');
    if (!password) missing.push('password');
    if (!userType) missing.push('userType');
    if (missing.length) {
      return res.status(400).json({ message: `${missing.join(', ')} ${missing.length > 1 ? 'are' : 'is'} required` });
    }

    // check if email exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // check if username exists
    if (await User.findByUsername(username)) {
      return res.status(400).json({ message: "Username already taken" });
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
    const isDev = process.env.NODE_ENV !== 'production';
    res.status(500).json({ message: "Server error", ...(isDev && { detail: err.message }) });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, username, identifier, password, userType } = req.body;

    // Determine identifier: prefer explicit identifier, else email/username fields
    const id = (identifier || email || username || '').toString().trim();
    if (!id) {
      return res.status(400).json({ message: "Email or username is required" });
    }
    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    // find user by email or username
    const isEmail = id.includes('@');
    const user = isEmail ? await User.findByEmail(id) : await User.findByUsername(id);
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // check userType
    if (userType && user.userType !== userType) {
      return res.status(403).json({ message: `User is not a ${userType}` });
    }

    // sign token
    if (!process.env.JWT_SECRET) {
      console.error("Missing JWT_SECRET in environment");
      return res.status(500).json({ message: "Server misconfigured" });
    }
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

    const portal = user.userType === 'investor' ? 'I' : 'S';
    const redirectPath = `/${portal}/handbook/home`;

    res.json({
      message: "Login successful",
      token,
      user: { id: user.id, username: user.username, email: user.email, userType: user.userType },
      redirectPath
    });
  } catch (err) {
    console.error("Login Error:", err);
    const isDev = process.env.NODE_ENV !== 'production';
    res.status(500).json({ message: "Server error", ...(isDev && { detail: err.message }) });
  }
};
