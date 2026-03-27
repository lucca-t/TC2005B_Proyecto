const express = require('express');
const router = express.Router();
const isAuth = require('../util/is-auth');
const projectsController = require('../controllers/projects.controller');

router.get('/add', isAuth, projectsController.get_add);
router.post('/add', isAuth, projectsController.post_add);

module.exports = router;
