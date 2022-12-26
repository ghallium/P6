const express = require('express');
const router = express.Router();

const userCtrl = require('../controllers/user');
const password = require('../middleware/password'); // importation middleware password
const controleEmail = require("../middleware/controleEmail"); // importation middleware email

router.post('/signup', password, controleEmail, userCtrl.signup);
router.post('/login', password, userCtrl.login);

module.exports = router;