/* eslint-disable new-cap */
const express = require('express');
const router = express.Router();
const isAuth = require('../util/is-auth');
const {authorize, ROLES} = require('../util/rbac');
const projectsController = require('../controllers/projects.controller');

const adminOrLead = authorize(ROLES.ADMIN, ROLES.LEAD);
const allRoles = authorize(ROLES.ADMIN, ROLES.LEAD, ROLES.MEMBER);

// FR-03: Consultar Proyecto - Admin, Lead, Member
router.get('/list', isAuth, allRoles, projectsController.get_list);
router.get('/details/:projectId', isAuth, allRoles, projectsController.get_details);
router.get('/report/:projectId', isAuth, allRoles, projectsController.getReport);
router.post('/report/:projectId', isAuth, allRoles, projectsController.postReport);

// FR-01: Registrar Proyecto - Admin, Lead
router.get('/add', isAuth, adminOrLead, projectsController.get_add);
router.post('/add', isAuth, adminOrLead, projectsController.post_add);

// FR-04: Editar Proyecto - Admin, Lead
router.get('/edit/:id', isAuth, adminOrLead, projectsController.get_edit);
router.post('/edit/:id', isAuth, adminOrLead, projectsController.post_edit);

// FR-02: Eliminar Proyecto - Admin, Lead
router.post('/delete/:id', isAuth, adminOrLead, projectsController.post_delete);

// FR-15: Vincular proyecto a equipo - Admin, Lead
router.get('/link/:id', isAuth, adminOrLead, projectsController.get_link);
router.post('/link/:id', isAuth, adminOrLead, projectsController.post_link);

module.exports = router;
