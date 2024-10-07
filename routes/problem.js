// routes/problems.js
const express = require('express');
const router = express.Router();
const { createCode, createTestCase, createProblem, getProblemWithId, getAllProblems } = require("../controllers/problems")
const catchAsync = require("../utils/catchAsync")



// Create a new problem (admin only)
router.post('/createProblem', catchAsync(createProblem));

// routes/problems.js (continuation)
// Get a problem by ID
router.get('/:id', catchAsync(getProblemWithId));


//createTestCases
router.post('/createTestCases', catchAsync(createTestCase))

//Create Code
router.post('/createCode', catchAsync(createCode))

//Get all Problems

router.get("/", catchAsync(getAllProblems))

module.exports = router;
