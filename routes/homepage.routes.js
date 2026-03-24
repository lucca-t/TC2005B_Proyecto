const express = require('express');
const router = express.Router();

const homepageController = require('../controllers/homepage.controller');

router.get('/', homepageController.get_homepage);

module.exports = router;    