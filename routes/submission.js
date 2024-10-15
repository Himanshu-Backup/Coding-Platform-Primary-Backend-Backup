// routes/submissions.js
const express = require('express');
const router = express.Router();
const axios = require('axios');
const { handleSubmission, handleRun } = require("../controllers/problemSubmissionController")
// const { authMiddleware } = require("../middlewares/authMiddleware")
// const Problem = require('../models/Problem');
// const Code = require('../models/Code'); // Import Code model if needed

// Judge0 API URL and key (you need to sign up at Judge0 to get the key)
const JUDGE0_API_URL = 'https://judge0-ce.p.rapidapi.com';
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY;

// Submit code for a problem
//Submitting a problem requires user to be logged in
router.post('/:id/submit', handleSubmission);

// Handle req for code run against sample test cases associated with a problem
//Running a problem doesn't requires that the user must be logged in
router.post('/:id/run', handleRun);


module.exports = router;
