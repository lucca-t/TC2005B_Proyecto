const express = require('express');
const router = express.Router();
const isAuth = require('../util/is-auth');
const reportsController = require('../controllers/reports.controller');

router.get('/user', isAuth, reportsController.get_user_report);
router.get('/team', isAuth, reportsController.get_team_report);
router.get('/project', isAuth, reportsController.get_project_report);
router.get('/', isAuth, reportsController.get_reports);

module.exports = router;  