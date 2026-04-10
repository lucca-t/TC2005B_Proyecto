/* eslint-disable new-cap */
const express = require('express');
const router = express.Router();
const isAuth = require('../util/is-auth');
const projectsController = require('../controllers/projects.controller');

router.get('/add', isAuth, projectsController.get_add);
router.post('/add', isAuth, projectsController.post_add);
router.get('/list', isAuth, projectsController.get_list);

module.exports = router;
