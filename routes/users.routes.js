const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');

router.get('/list', usersController.get_list); 
router.get('/edit/:email', usersController.get_edit); 
router.post('/edit/:email', usersController.post_edit);
router.get('/add', usersController.get_add);
router.post('/add', usersController.post_add);

module.exports = router;