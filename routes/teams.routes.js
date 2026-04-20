const express = require('express');
const router = express.Router();
const isAuth = require('../util/is-auth');
const {authorize, ROLES} = require('../util/rbac');
const teamsController = require('../controllers/teams.controller');

const adminOrLead = authorize(ROLES.ADMIN, ROLES.LEAD);
const allRoles = authorize(ROLES.ADMIN, ROLES.LEAD, ROLES.MEMBER);

// FR-11: Consultar Equipo - Admin, Lead, Member
router.get('/list', isAuth, allRoles, teamsController.getList);
router.get('/details/:teamId', isAuth, allRoles, teamsController.getDetails);

// FR-09: Registrar Equipo - Admin, Lead
router.get('/add', isAuth, adminOrLead, teamsController.getAdd);
router.post('/add', isAuth, adminOrLead, teamsController.postAdd);

// FR-12: Editar Equipo / FR-16: Vincular usuario a equipo - Admin, Lead
router.get('/edit/:teamId', isAuth, adminOrLead, teamsController.getEdit);
router.post('/edit/:teamId', isAuth, adminOrLead, teamsController.postEdit);

// FR-10: Eliminar Equipo - Admin, Lead
router.post('/delete/:id', isAuth, adminOrLead, teamsController.postDelete);

module.exports = router;
