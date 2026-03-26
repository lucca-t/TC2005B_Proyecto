const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');

router.get('/list', usersController.get_list); 
router.get('/edit/:username', usersController.get_edit); //Here we should do a way to edit a specific user
router.get('/add', usersController.get_add);
router.post('/add', usersController.post_add);

module.exports = router;