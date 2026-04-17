const express = require('express');
const router = express.Router();
const isAuth = require('../util/is-auth');
const usersController = require('../controllers/users.controller');

router.get('/list', isAuth, usersController.get_list);
router.get('/edit/:email', isAuth, usersController.get_edit);
router.post('/edit/:email', isAuth, usersController.post_edit);
router.get('/add', isAuth, usersController.get_add);
router.post('/add', isAuth, usersController.post_add);
router.get('/role/:userId', isAuth, usersController.get_role);
router.post('/role/:userId', isAuth, usersController.post_role);
router.post('/delete/:userId', isAuth, usersController.post_delete);
router.get('/report/:userId', isAuth, usersController.get_report);
router.post('/report/:userId', isAuth, usersController.post_report);

module.exports = router;
