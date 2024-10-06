// routes/submissions.js
const express = require('express');
const router = express.Router();
const axios = require('axios');
const Problem = require('../models/Problem');

// Judge0 API URL and key (you need to sign up at Judge0 to get the key)
const JUDGE0_API_URL = 'https://judge0-ce.p.rapidapi.com';
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY;

// Submit code for a problem
router.post('/:id/submit', async (req, res) => {
    const { userCode } = req.body; // The function code submitted by the user
    const problemId = req.params.id;

    try {
        const problem = await Problem.findById(problemId);
        if (!problem) return res.status(404).json({ msg: 'Problem not found' });

        // Concatenate preCode, user code, and postCode
        const completeCode = `${problem.preCode}\n${userCode}\n${problem.postCode}`;

        // Send code to Judge0 API for evaluation
        const submissionResponse = await axios.post(`${JUDGE0_API_URL}/submissions?base64_encoded=false`, {
            source_code: completeCode,
            language_id: 52, // Assume 52 is for Python; change based on your language
            stdin: problem.sampleTestCases[0].input, // You can send multiple test cases one by one
            expected_output: problem.sampleTestCases[0].output
        }, {
            headers: {
                'x-rapidapi-key': JUDGE0_API_KEY,
                'Content-Type': 'application/json'
            }
        });

        const submissionResult = submissionResponse.data;

        res.json({ submissionResult });
    } catch (err) {
        res.status(500).json({ error: 'Server Error' });
    }
});

module.exports = router;
