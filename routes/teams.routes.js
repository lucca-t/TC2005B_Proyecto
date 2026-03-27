const express = require('express');
const router = express.Router();
const teamsController = require('../controllers/teams.controller');

router.get('/list', teamsController.get_list); 
router.get('/edit', teamsController.get_edit); //Here we should do a way to edit a specific team
router.get('/add', teamsController.get_add);
router.post('/add', teamsController.post_add);

module.exports = router;