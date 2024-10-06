// routes/problems.js
const express = require('express');
const router = express.Router();
const Problem = require('../models/Problem');

// Create a new problem (admin only)
router.post('/create', async (req, res) => {
    const { title, description, preCode, postCode, solutionCode, sampleTestCases } = req.body;

    try {
        const newProblem = new Problem({ title, description, preCode, postCode, solutionCode, sampleTestCases });
        await newProblem.save();
        res.status(201).json(newProblem);
    } catch (err) {
        res.status(500).json({ error: 'Server Error' });
    }
});

// routes/problems.js (continuation)
// Get a problem by ID
router.get('/:id', async (req, res) => {
    try {
        const problem = await Problem.findById(req.params.id);
        if (!problem) return res.status(404).json({ msg: 'Problem not found' });
        res.json(problem);
    } catch (err) {
        res.status(500).json({ error: 'Server Error' });
    }
});


module.exports = router;
