const express = require('express');
const router = express.Router();

const {signup, login} = require('../controllers/authController');

router.post('/signup', signup); // post/ api/ auth/ signup
router.post('/login', login); // post/ api/ auth/ login

module.exports = router;