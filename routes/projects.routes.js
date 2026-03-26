const express = require('express');
const router = express.Router();

const projectsController = require('../controllers/projects.controller');

router.get('/add', projectsController.get_add);
router.post('/add', projectsController.post_add);

module.exports = router;
