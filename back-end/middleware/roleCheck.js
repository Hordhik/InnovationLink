module.exports = function (roles = []) {
  if (typeof roles === "string") {
    roles = [roles]; // allow single role string
  }

  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.userType)) {
      return res.status(403).json({ message: 'Forbidden: insufficient rights.' });
    }
    next();
  };
};
