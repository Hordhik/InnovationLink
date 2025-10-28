const jwt = require('jsonwebtoken');
const User = require('../models/userModel'); // Make sure this path is correct

module.exports = async function (req, res, next) {
  // --- LOGGING ---
  console.log(`>>> requireAuth: Checking token for ${req.method} ${req.originalUrl}`);
  let token = null;

  // 1. Try to get token from Authorization header (for normal API calls)
  const authHeader = req.header('Authorization') || req.header('authorization');
  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
    // --- LOGGING ---
    console.log(">>> requireAuth: Found token in Authorization header.");
  }

  // 2. If not in header, check query parameter (for file download links)
  if (!token && req.query.token) {
    token = req.query.token;
    // --- LOGGING ---
    console.log(">>> requireAuth: Found token in query parameter.");
  }

  // 3. If still no token, reject
  if (!token) {
    // --- LOGGING ---
    console.log(">>> requireAuth: No token found. Rejecting with 401.");
    return res.status(401).json({ message: 'Unauthorized: No token provided.' });
  }

  try {
    // 4. Verify the token
    // --- LOGGING ---
    console.log(">>> requireAuth: Verifying token...");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // --- LOGGING ---
    console.log(">>> requireAuth: Token verified. Decoded ID:", decoded.id);

    // 5. Fetch the full user from DB
    // --- LOGGING ---
    console.log(`>>> requireAuth: Fetching user with ID: ${decoded.id}`);
    const user = await User.findById(decoded.id);

    if (!user) {
      // --- LOGGING ---
      console.log(`>>> requireAuth: User with ID ${decoded.id} not found. Rejecting with 401.`);
      return res.status(401).json({ message: 'Unauthorized: User not found.' });
    }

    // 6. Attach the complete user object to req.user
    req.user = user;
    // --- LOGGING ---
    console.log(">>> requireAuth: User authenticated successfully. Attaching user to req.user.");

    next(); // Proceed to the next middleware or route handler
  } catch (err) {
    // --- LOGGING ---
    console.error(">>> requireAuth: Error during token verification or user fetch:", err.message);
    return res.status(401).json({ message: 'Unauthorized: Invalid or expired token.' });
  }
};

