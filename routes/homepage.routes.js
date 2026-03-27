const express = require('express');
const router = express.Router();
const isAuth = require('../util/is-auth');
const homepageController = require('../controllers/homepage.controller');

router.get('/', isAuth, homepageController.get_homepage);

module.exports = router;    