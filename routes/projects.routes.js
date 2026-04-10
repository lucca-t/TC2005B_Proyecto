/* eslint-disable new-cap */
const express = require('express');
const router = express.Router();
const isAuth = require('../util/is-auth');
const projectsController = require('../controllers/projects.controller');

router.get('/list', isAuth, projectsController.get_list);
router.get('/add', isAuth, projectsController.get_add);
router.post('/add', isAuth, projectsController.post_add);
router.get('/edit/:id', isAuth, projectsController.get_edit);
router.post('/edit/:id', isAuth, projectsController.post_edit);
router.post('/delete/:id', isAuth, projectsController.post_delete);
router.get('/link/:id', isAuth, projectsController.get_link);
router.post('/link/:id', isAuth, projectsController.post_link);

module.exports = router;
