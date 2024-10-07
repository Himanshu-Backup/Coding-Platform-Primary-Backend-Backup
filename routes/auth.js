// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validateUserRegister } = require("../middlewares/validateUserRegister")
const { register, login } = require("../controllers/auth");
const { validateUserLogin } = require('../middlewares/validateUserLogin');
const catchAsync = require("../utils/catchAsync")

// Register a new user
router.post('/register', validateUserRegister, catchAsync(register));

//Login a user
router.post('/login', validateUserLogin, catchAsync(login));


module.exports = router;
