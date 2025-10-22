const express = require('express');
const requireAuth = require('../middleware/auth');
const teamController = require('../controllers/teamController');

const router = express.Router();

// add team member - username/company inferred from token/profile
router.post('/', requireAuth, teamController.addMember);

// replace all team members for the authenticated user
router.post('/bulk', requireAuth, teamController.setMyTeam);

// get all members
router.get('/', requireAuth, teamController.getAllMembers);

// get member by id
router.get('/id/:id', requireAuth, teamController.getMemberById);

// get members by name (partial match)
router.get('/name/:name', requireAuth, teamController.getMembersByName);

// get members by username
router.get('/user/:username', requireAuth, teamController.getMembersByUsername);

// get members by company name
router.get('/company/:company', requireAuth, teamController.getMembersByCompany);

// get members for authenticated user
router.get('/me', requireAuth, teamController.getMyMembers);

module.exports = router;
