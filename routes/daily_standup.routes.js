const express = require('express');
const router = express.Router();
const standupController = require('../controllers/daily_standup.controller');

router.get('/', standupController.get_standup_form);

router.post('/', standupController.post_standup);

module.exports = router;
