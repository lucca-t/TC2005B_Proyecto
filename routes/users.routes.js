const express = require('express');
const router = express.Router();
const isAuth = require('../util/is-auth');
const {authorize, ROLES} = require('../util/rbac');
const usersController = require('../controllers/users.controller');

const adminOnly = authorize(ROLES.ADMIN);
const adminAndLead = authorize(ROLES.ADMIN, ROLES.LEAD);
const allRoles = authorize(ROLES.ADMIN, ROLES.LEAD, ROLES.MEMBER);

// FR-07: Read User - Admin, Lead
router.get('/list', isAuth, allRoles, usersController.get_list);

// FR-05: Register User - Admin
router.get('/add', isAuth, adminOnly, usersController.get_add);
router.post('/add', isAuth, adminOnly, usersController.post_add);

// FR-08: Edit User - Admin
router.get('/edit/:email', isAuth, adminOnly, usersController.get_edit);
router.post('/edit/:email', isAuth, adminOnly, usersController.post_edit);

// FR-17: Link role to user - Admin
router.get('/role/:userId', isAuth, adminOnly, usersController.get_role);
router.post('/role/:userId', isAuth, adminOnly, usersController.post_role);

// FR-06: Delete User - Admin
router.post('/delete/:userId', isAuth, adminOnly, usersController.post_delete);

// FR-18: Register member report - Admin, Lead, Member
router.get('/report/:userId', isAuth, allRoles, usersController.get_report);
router.post('/report/:userId', isAuth, allRoles, usersController.post_report);

module.exports = router;
