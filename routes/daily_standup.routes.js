const express = require('express');
const router = express.Router();
const isAuth = require('../util/is-auth');
const {authorize, ROLES} = require('../util/rbac');
const standupController = require('../controllers/daily_standup.controller');

const allRoles = authorize(ROLES.ADMIN, ROLES.LEAD, ROLES.MEMBER);

// FR-22: Registrar actividad - Admin, Lead, Member
router.get('/', isAuth, allRoles, standupController.get_standup_form);
router.post('/', isAuth, allRoles, standupController.post_standup);

// FR-24: Consultar actividad - Admin, Lead, Member
router.get('/history', isAuth, allRoles, standupController.get_standup_history);

// FR-24: Consultar actividad del equipo - Admin, Lead
router.get('/history/team', isAuth, authorize(ROLES.ADMIN, ROLES.LEAD), standupController.get_team_standup_history);

// FR-23: Eliminar actividad - Admin, Lead, Member
router.post('/history/:id', isAuth, allRoles, standupController.post_deleteRegister);

// FR-25: Editar actividad - Admin, Lead, Member
router.get('/edit/:id', isAuth, allRoles, standupController.get_standup_edit);
router.post('/edit/:id', isAuth, allRoles, standupController.post_standup_edit);


module.exports = router;
