const express = require('express');
const router = express.Router();
const teamnsController = require('../controllers/teams.controller');

router.get('/list', teamnsController.get_list); 
router.get('/edit', teamnsController.get_edit); //Here we should do a way to edit a specific team
router.get('/add', teamnsController.get_add);

module.exports = router;