const express = require('express');
const router = express.Router();

const standupApiController = require('../controllers/standup_api.controller');

router.post('/slack', standupApiController.post_slack_standup);

module.exports = router;
