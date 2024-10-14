const express = require('express');
const router = express.Router();
const { getProblems, createProblem, updateProblem, createTestCase, createProblemLanguageMapping, getProblemDetails, createProblemLanguageCodeMapping } = require('../controllers/problemController');

// Route to get all problems (just titles and ids)
router.get('/', getProblems);

// Route to create a new problem
router.post('/createProblem', createProblem);

// Route to update a problem by problem ID
router.put('/updateProblem/:id', updateProblem);

// Route to create a test case for a problem
router.post('/createTestCase', createTestCase);

// Route to create language mapping for a problem
router.post('/createProblemLanguageMapping', createProblemLanguageMapping);

// Route to get problem details for attempting
router.get('/attempt/:problemId', getProblemDetails);

// Route to create language code mapping
router.post('/createProblemLanguageCodeMapping', createProblemLanguageCodeMapping);

module.exports = router;
