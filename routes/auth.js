// routes/auth.js
const express = require('express');
const router = express.Router();
const { validateUserRegister } = require("../middlewares/validateUserRegister")
const { register, login, getProfile } = require("../controllers/auth");
const { validateUserLogin } = require('../middlewares/validateUserLogin');
const catchAsync = require("../utils/catchAsync")
const { fetchUser } = require("../middlewares/fetchUser")

// Register a new user
router.post('/register', validateUserRegister, catchAsync(register));

//Login a user
router.post('/login', validateUserLogin, catchAsync(login));

// Profile
router.get('/profile', fetchUser, catchAsync(getProfile))


module.exports = router;
