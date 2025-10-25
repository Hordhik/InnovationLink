const jwt = require('jsonwebtoken');
const User = require('../models/userModel'); // Make sure this path is correct

module.exports = async function (req, res, next) {
  let token = null;

  // 1. Try to get token from Authorization header (for normal API calls)
  const authHeader = req.header('Authorization') || req.header('authorization');
  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  // 2. If not in header, check query parameter (for file download links)
  if (!token && req.query.token) {
    token = req.query.token;
  }

  // 3. If still no token, reject
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: No token provided.' });
  }

  try {
    // 4. Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 5. Fetch the full user from DB (this is from our previous fix)
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized: User not found.' });
    }

    // 6. Attach the complete user object to req.user
    req.user = user;

    next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized: Invalid or expired token.' });
  }
};
