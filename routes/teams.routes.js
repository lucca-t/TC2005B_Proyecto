const express = require('express');
const router = express.Router();
const isAuth = require('../util/is-auth');
const teamsController = require('../controllers/teams.controller');

router.get('/list', isAuth, teamsController.get_list);
router.get('/edit', isAuth, teamsController.get_edit);
router.get('/add', isAuth, teamsController.get_add);

module.exports = router;