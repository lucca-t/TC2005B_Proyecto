const express = require('express');
const router = express.Router();

const prototypeController = require('../controllers/prototype.controller');

router.get('/user_report', prototypeController.get_user_report);
router.get('/team_report', prototypeController.get_team_report);
router.get('/project_report', prototypeController.get_project_report);
router.get('/', prototypeController.get_prototype);

module.exports = router;    