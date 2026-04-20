const express = require('express');
const router = express.Router();
const isAuth = require('../util/is-auth');
const {authorize, ROLES} = require('../util/rbac');
const usersController = require('../controllers/users.controller');

const adminOnly = authorize(ROLES.ADMIN);
const allRoles = authorize(ROLES.ADMIN, ROLES.LEAD, ROLES.MEMBER);

// FR-07: Consultar Usuario - Admin, Lead, Member
router.get('/list', isAuth, allRoles, usersController.get_list);

// FR-05: Registrar Usuario - Admin
router.get('/add', isAuth, adminOnly, usersController.get_add);
router.post('/add', isAuth, adminOnly, usersController.post_add);

// FR-08: Editar Usuario - Admin
router.get('/edit/:email', isAuth, adminOnly, usersController.get_edit);
router.post('/edit/:email', isAuth, adminOnly, usersController.post_edit);

// FR-17: Vincular rol a usuario - Admin
router.get('/role/:userId', isAuth, adminOnly, usersController.get_role);
router.post('/role/:userId', isAuth, adminOnly, usersController.post_role);

// FR-06: Eliminar Usuario - Admin
router.post('/delete/:userId', isAuth, adminOnly, usersController.post_delete);

// FR-18: Registrar reporte de miembro - Admin, Lead, Member
router.get('/report/:userId', isAuth, allRoles, usersController.get_report);
router.post('/report/:userId', isAuth, allRoles, usersController.post_report);

module.exports = router;
