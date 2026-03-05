const express = require('express');
const router = express.Router();

const prototypeController = require('../controllers/prototype.controller');

router.get('/', prototypeController.get_prototype);

module.exports = router;    