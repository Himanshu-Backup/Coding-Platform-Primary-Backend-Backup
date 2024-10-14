const Problem = require('../models/Problem');
const ProblemTestCaseMapping = require('../models/ProblemTestCaseMapping');
const ProblemLanguageMapping = require('../models/ProblemLanguageMapping');
const ProblemLanguageCodeMapping = require('../models/ProblemLanguageCodeMapping');
const axios = require('axios');

const JUDGE0_API_URL = process.env.JUDGE0_API_URL; // Make sure to configure these in your environment
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY;

// Handles code submission by a user
const handleSubmission = async (req, res) => {
    const { userCode, language } = req.body;  // Code submitted by the user and the selected language
    const problemId = req.params.id;  // Problem ID from the URL

    try {
        // Fetch the problem by ID and populate related language and test case mappings
        const problem = await Problem.findById(problemId)
            .populate({
                path: 'ProblemLanguageMapping',  // Populate language mapping for the problem
                populate: { path: 'ProblemLanguageCodeMapping' }  // Deep populate code mappings
            })
            .populate('testCases');  // Populate test case mappings
        if (!problem) return res.status(404).json({ msg: 'Problem not found' });

        // Find the relevant language mapping for the selected language
        const languageMapping = await ProblemLanguageMapping.findOne({ problemID: problemId, language });
        if (!languageMapping) {
            return res.status(404).json({ msg: `No language mapping found for ${language}` });
        }

        // Get the corresponding code mappings for this language
        const codeMapping = await ProblemLanguageCodeMapping.findOne({ problemLanguageMappingID: languageMapping._id });
        if (!codeMapping) {
            return res.status(404).json({ msg: `No code mappings found for the selected language: ${language}` });
        }

        // Concatenate the preCode, userCode, and postCode to form the complete code
        const completeCode = `${codeMapping.preCode}\n${userCode}\n${codeMapping.postCode}`;

        const results = [];

        // Loop through sample test cases and evaluate them
        for (const testCase of problem.sampleTestCases) {
            // Send code to Judge0 API for evaluation
            const submissionResponse = await axios.post(`${JUDGE0_API_URL}/submissions?base64_encoded=false`, {
                source_code: completeCode,
                language_id: codeMapping.languageId,  // Assuming you have a language ID mapping in codeMapping
                stdin: testCase.input,
                expected_output: testCase.output
            }, {
                headers: {
                    'x-rapidapi-key': JUDGE0_API_KEY,
                    'Content-Type': 'application/json'
                }
            });

            const submissionResult = submissionResponse.data;
            results.push({
                input: testCase.input,
                expected_output: testCase.output,
                actual_output: submissionResult.output,
                success: submissionResult.output === testCase.output
            });
        }

        // Check if all sample test cases passed
        const allSamplePassed = results.every(result => result.success);

        if (allSamplePassed) {
            // Now, loop through all other test cases (non-sample test cases)
            const otherResults = [];
            for (const testCaseId of problem.testCases) {
                const testCase = await ProblemTestCaseMapping.findById(testCaseId);
                if (!testCase) continue;  // Skip if test case is not found

                // Send code to Judge0 API for evaluation
                const submissionResponse = await axios.post(`${JUDGE0_API_URL}/submissions?base64_encoded=false`, {
                    source_code: completeCode,
                    language_id: codeMapping.languageId,
                    stdin: testCase.input,
                    expected_output: testCase.output
                }, {
                    headers: {
                        'x-rapidapi-key': JUDGE0_API_KEY,
                        'Content-Type': 'application/json'
                    }
                });

                const submissionResult = submissionResponse.data;
                otherResults.push({
                    input: testCase.input,
                    expected_output: testCase.output,
                    actual_output: submissionResult.output,
                    success: submissionResult.output === testCase.output
                });
            }

            // Return both sample and other test case results
            res.json({ results, otherResults });
        } else {
            // Return results of sample test cases only if not all passed
            res.json({ results });
        }
    } catch (err) {
        console.error(err);  // Log the error for debugging
        res.status(500).json({ error: 'Server error' });
    }
};

const handleRun = async (req, res) => {
    const { userCode, language } = req.body;  // User's submitted code and language
    const problemId = req.params.id;  // Problem ID from the URL

    try {
        // Fetch the problem and populate the language and test case mappings
        const problem = await Problem.findById(problemId)
            .populate({
                path: 'ProblemLanguageMapping',
                populate: { path: 'ProblemLanguageCodeMapping' }
            });
        if (!problem) return res.status(404).json({ msg: 'Problem not found' });

        // Find the relevant language mapping for the submitted language
        const languageMapping = await ProblemLanguageMapping.findOne({ problemID: problemId, language });
        if (!languageMapping) {
            return res.status(404).json({ msg: `No language mapping found for ${language}` });
        }

        // Fetch the corresponding code mapping
        const codeMapping = await ProblemLanguageCodeMapping.findOne({ problemLanguageMappingID: languageMapping._id });
        if (!codeMapping) {
            return res.status(404).json({ msg: `No code mappings found for the selected language: ${language}` });
        }

        // Concatenate the preCode, userCode, and postCode
        const completeCode = `${codeMapping.preCode}\n${userCode}\n${codeMapping.postCode}`;

        const results = [];

        // Loop through the sample test cases and send code to Judge0 API for evaluation
        for (const testCase of problem.sampleTestCases) {
            const submissionResponse = await axios.post(`${JUDGE0_API_URL}/submissions?base64_encoded=false`, {
                source_code: completeCode,
                language_id: codeMapping.languageId,  // Assuming languageId exists in codeMapping
                stdin: testCase.input,
                expected_output: testCase.output
            }, {
                headers: {
                    'x-rapidapi-key': JUDGE0_API_KEY,
                    'Content-Type': 'application/json'
                }
            });

            const submissionResult = submissionResponse.data;
            results.push({
                input: testCase.input,
                expected_output: testCase.output,
                actual_output: submissionResult.output,
                success: submissionResult.output === testCase.output
            });
        }

        res.json({ results });  // Return results of sample test cases
    } catch (err) {
        console.error(err);  // Log the error for debugging
        res.status(500).json({ error: 'Server error' });
    }
};


module.exports = {
    handleSubmission,
    handleRun
};
