const express = require('express');
const router = express.Router();
const loginController = require('../controllers/login.controller');

router.get('/', loginController.get_login);
router.post('/', loginController.post_login);

module.exports = router;
