const express = require('express');
const router = express.Router();
const isAuth = require('../util/is-auth');
const standupController = require('../controllers/daily_standup.controller');

router.get('/', isAuth, standupController.get_standup_form);
router.post('/', isAuth, standupController.post_standup);
router.get('/history', isAuth, standupController.get_standup_history);

module.exports = router;
