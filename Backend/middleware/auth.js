// Backend/middleware/auth.js

const jwt = require('jsonwebtoken');
const User = require('../models/userModel'); // 1. Import your User model

// 2. Make the function async
module.exports = async function (req, res, next) {
  const authHeader = req.header('Authorization') || req.header('authorization');
  const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Fetch the full user from DB using the ID from the token
    // Assuming you have a function like 'findById' in your userModel
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized: User not found.' });
    }

    // 4. Attach the complete user object to req.user
    // This object will now contain id, username, userType, email, etc.
    req.user = user;

    next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized: Invalid or expired token.' });
  }
};