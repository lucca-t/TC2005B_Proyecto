const express = require('express');
const router = express.Router();
const isAuth = require('../util/is-auth');
const {authorize, ROLES} = require('../util/rbac');
const teamsController = require('../controllers/teams.controller');

const adminOrLead = authorize(ROLES.ADMIN, ROLES.LEAD);
const allRoles = authorize(ROLES.ADMIN, ROLES.LEAD, ROLES.MEMBER);

// FR-11: Read Team - Admin, Lead, Member
router.get('/list', isAuth, allRoles, teamsController.getList);
router.get('/search', isAuth, allRoles, teamsController.getSearch);
router.get('/details/:teamId', isAuth, allRoles, teamsController.getDetails);

// FR-09: Register Team - Admin, Lead
router.get('/add', isAuth, adminOrLead, teamsController.getAdd);
router.post('/add', isAuth, adminOrLead, teamsController.postAdd);

// FR-12: Edit Team / FR-16: Link member to team - Admin, Lead
router.get('/edit/:teamId', isAuth, adminOrLead, teamsController.getEdit);
router.post('/edit/:teamId', isAuth, adminOrLead, teamsController.postEdit);

// FR-10: Delete Team - Admin, Lead
router.post('/delete/:id', isAuth, adminOrLead, teamsController.postDelete);

module.exports = router;
