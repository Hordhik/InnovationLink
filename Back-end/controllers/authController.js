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

    // Enforce no spaces in username
    if (/\s/.test(username)) {
      return res.status(400).json({ message: 'Username cannot contain spaces. Please use letters, numbers, underscores, or hyphens.' });
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

    // Issue JWT so the user can proceed to protected profile endpoints immediately
    if (!process.env.JWT_SECRET) {
      console.error("Missing JWT_SECRET in environment");
      return res.status(500).json({ message: "Server misconfigured" });
    }
    let token;
    try {
      token = jwt.sign(
        { id: userId, userType },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
    } catch (tokenErr) {
      console.error("JWT Sign Error (register):", tokenErr);
      return res.status(500).json({ message: "Authentication error" });
    }

    res.status(201).json({
      message: "User registered successfully",
      user: { id: userId, username, email, phone, userType },
      token,
      redirectPath: userType === 'investor' ? '/I/profile' : '/S/profile'
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

    // Do not block login on userType mismatch; the actual userType will be used downstream

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
    const redirectPath = `/${portal}/home`;

    // Derive a friendly display name from profile tables
    let profileName = '';
    try {
      if (user.userType === 'startup') {
        const startup = await Startup.findByUserId(user.id);
        profileName = startup?.name || '';
      } else if (user.userType === 'investor') {
        const investor = await Investor.findByUserId(user.id);
        profileName = investor?.name || '';
      }
    } catch (nameErr) {
      // Non-fatal; fall back to username
      console.warn('Profile name lookup failed:', nameErr.message);
    }
    const safeName = profileName || user.username || user.email;

    res.json({
      message: "Login successful",
      token,
      user: { id: user.id, username: user.username, name: safeName, email: user.email, userType: user.userType },
      redirectPath
    });
  } catch (err) {
    console.error("Login Error:", err);
    const isDev = process.env.NODE_ENV !== 'production';
    res.status(500).json({ message: "Server error", ...(isDev && { detail: err.message }) });
  }
};

// Return active session details using JWT (protected by auth middleware)
exports.session = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Attach friendly name from profile tables
    let profileName = '';
    try {
      if (user.userType === 'startup') {
        const startup = await Startup.findByUserId(user.id);
        profileName = startup?.name || '';
      } else if (user.userType === 'investor') {
        const investor = await Investor.findByUserId(user.id);
        profileName = investor?.name || '';
      }
    } catch (nameErr) {
      console.warn('Session profile name lookup failed:', nameErr.message);
    }
    const safeName = profileName || user.username || user.email;

    res.json({
      authenticated: true,
      user: { id: user.id, username: user.username, name: safeName, email: user.email, userType: user.userType }
    });
  } catch (err) {
    console.error('Session Error:', err);
    const isDev = process.env.NODE_ENV !== 'production';
    res.status(500).json({ message: 'Server error', ...(isDev && { detail: err.message }) });
  }
};
