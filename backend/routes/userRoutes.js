const express = require('express');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const router = express.Router();

router.get('/me', auth, (req, res) => {
  res.json({ message: "Welcome", user: req.user });
});

router.get('/admin', auth, roleCheck(['admin']), (req, res) => {
  res.json({ message: "Hello Admin" });
});

module.exports = router;
