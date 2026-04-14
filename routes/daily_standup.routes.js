const express = require('express');
const router = express.Router();
const isAuth = require('../util/is-auth');
const standupController = require('../controllers/daily_standup.controller');

router.get('/', isAuth, standupController.get_standup_form);
router.post('/', isAuth, standupController.post_standup);
router.get('/history', isAuth, standupController.get_standup_history);
router.post('/history/:id', isAuth, standupController.post_deleteRegister);
router.get('/edit/:id', isAuth, standupController.get_standup_edit);
router.post('/edit/:id', isAuth, standupController.post_standup_edit);


module.exports = router;
