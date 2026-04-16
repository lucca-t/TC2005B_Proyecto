const express = require('express');
const router = express.Router();
const isAuth = require('../util/is-auth');
const teamsController = require('../controllers/teams.controller');

router.get('/list', isAuth, teamsController.getList);
router.get('/edit/:teamId', isAuth, teamsController.getEdit);
router.post('/edit/:teamId', isAuth, teamsController.postEdit);
router.get('/add', isAuth, teamsController.getAdd);
router.post('/add', isAuth, teamsController.postAdd);
router.post('/delete/:id', isAuth, teamsController.postDelete);
router.get('/details/:teamId', isAuth, teamsController.getDetails);
module.exports = router;
