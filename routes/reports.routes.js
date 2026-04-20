const express = require('express');
const router = express.Router();
const isAuth = require('../util/is-auth');
const {authorize, ROLES} = require('../util/rbac');
const reportsController = require('../controllers/reports.controller');

const allRoles = authorize(ROLES.ADMIN, ROLES.LEAD, ROLES.MEMBER);

// FR-18: Reporte de miembro - Admin, Lead, Member
router.get('/user', isAuth, allRoles, reportsController.get_user_report);

// FR-19: Reporte de equipo - Admin, Lead, Member
router.get('/team', isAuth, allRoles, reportsController.get_team_report);

// FR-20: Reporte de proyecto - Admin, Lead, Member
router.get('/project', isAuth, allRoles, reportsController.get_project_report);

router.get('/', isAuth, allRoles, reportsController.get_reports);

module.exports = router;
