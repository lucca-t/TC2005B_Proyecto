const express = require('express');
const router = express.Router();

const reportsController = require('../controllers/reports.controller');

router.get('/user', reportsController.get_user_report);
router.get('/team', reportsController.get_team_report);
router.get('/project', reportsController.get_project_report);
router.get('/', reportsController.get_reports);

module.exports = router;  