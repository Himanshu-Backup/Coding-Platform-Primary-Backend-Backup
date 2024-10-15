const Problem = require('../models/Problem');
const ProblemTestCaseMapping = require('../models/ProblemTestCaseMapping');
const ProblemLanguageMapping = require('../models/ProblemLanguageMapping');
const ProblemLanguageCodeMapping = require('../models/ProblemLanguageCodeMapping');
const axios = require('axios');

const JUDGE0_API_URL = process.env.JUDGE0_API_URL; // Make sure to configure these in your environment
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY;

// Handles code submission by a user
const handleSubmission = async (req, res) => {
    const { userCode, language } = req.body;
    const problemId = req.params.id;

    try {
        // Fetch the problem details
        const problem = await Problem.findById(problemId)
            .populate({
                path: 'problemLanguageMapping',
                populate: { path: 'problemLanguageCodeMapping' }
            })
            .populate('testCases');
        if (!problem) return res.status(404).json({ msg: 'Problem not found' });

        // Find the relevant language mapping
        const languageMapping = await ProblemLanguageMapping.findOne({ problemID: problemId, language });
        if (!languageMapping) {
            return res.status(404).json({ msg: `No language mapping found for ${language}` });
        }

        // Get code mappings for this language
        const codeMapping = await ProblemLanguageCodeMapping.findOne({ problemLanguageMappingID: languageMapping._id });
        if (!codeMapping) {
            return res.status(404).json({ msg: `No code mappings found for the selected language: ${language}` });
        }

        // Prepare the complete code by concatenating preCode, userCode, and postCode
        const completeCode = `${codeMapping.preCode}\n${userCode}\n${codeMapping.postCode}`;

        const results = [];

        // Iterate over sample test cases
        for (const testCase of problem.sampleTestCases) {
            // Step 1: Create a submission
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

            if (submissionResponse.status !== 201) {
                return res.status(500).json({ msg: 'Error creating submission in Judge0' });
            }

            const token = submissionResponse.data.token;

            // Step 2: Poll for result using the token
            let submissionResult = null;
            while (true) {
                const resultResponse = await axios.get(`${JUDGE0_API_URL}/submissions/${token}?base64_encoded=false&fields=stdout,status_id,stderr`, {
                    headers: {
                        'x-rapidapi-key': JUDGE0_API_KEY
                    }
                });

                submissionResult = resultResponse.data;

                // Check if the result is ready (status_id == 3 means finished)
                if (submissionResult.status_id === 3) break;

                // Delay for a bit before checking again
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            // Check if the output matches the expected output
            results.push({
                input: testCase.input,
                expected_output: testCase.output,
                actual_output: submissionResult.stdout,
                success: submissionResult.stdout === testCase.output
            });
        }

        // Check if all sample test cases passed
        const allSamplePassed = results.every(result => result.success);

        if (allSamplePassed) {
            // Evaluate hidden test cases if all sample test cases passed
            const otherResults = [];
            for (const testCaseId of problem.testCases) {
                const testCase = await ProblemTestCaseMapping.findById(testCaseId);
                if (!testCase) continue;

                // Step 1: Create a submission for hidden test cases
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

                if (submissionResponse.status !== 201) {
                    return res.status(500).json({ msg: 'Error creating submission in Judge0 for hidden test case' });
                }

                const token = submissionResponse.data.token;

                // Step 2: Poll for the result using the token
                let submissionResult = null;
                while (true) {
                    const resultResponse = await axios.get(`${JUDGE0_API_URL}/submissions/${token}?base64_encoded=false&fields=stdout,status_id,stderr`, {
                        headers: {
                            'x-rapidapi-key': JUDGE0_API_KEY
                        }
                    });

                    submissionResult = resultResponse.data;

                    // Check if the result is ready
                    if (submissionResult.status_id === 3) break;

                    // Delay before checking again
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }

                // Check if the output matches the expected output
                otherResults.push({
                    input: testCase.input,
                    expected_output: testCase.output,
                    actual_output: submissionResult.stdout,
                    success: submissionResult.stdout === testCase.output
                });
            }

            // Return both sample and hidden test case results
            res.json({ results, otherResults });
        } else {
            // Return sample test case results if not all passed
            res.json({ results });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};


const handleRun = async (req, res) => {
    const { userCode, language } = req.body;
    const problemId = req.params.id;

    try {
        // Fetch the problem and populate mappings
        const problem = await Problem.findById(problemId)
            .populate({
                path: 'ProblemLanguageMapping',
                populate: { path: 'ProblemLanguageCodeMapping' }
            });
        if (!problem) return res.status(404).json({ msg: 'Problem not found' });

        // Find the relevant language mapping
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

        // Loop through the sample test cases and evaluate them
        for (const testCase of problem.sampleTestCases) {
            // Step 1: Create a submission
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

            if (submissionResponse.status !== 201) {
                return res.status(500).json({ msg: 'Error creating submission in Judge0' });
            }

            const token = submissionResponse.data.token;

            // Step 2: Poll for result using the token
            let submissionResult = null;
            while (true) {
                const resultResponse = await axios.get(`${JUDGE0_API_URL}/submissions/${token}?base64_encoded=false&fields=stdout,status_id,stderr`, {
                    headers: {
                        'x-rapidapi-key': JUDGE0_API_KEY
                    }
                });

                submissionResult = resultResponse.data;

                // Check if the result is ready (status_id == 3 means finished)
                if (submissionResult.status_id === 3) break;

                // Delay for a bit before checking again
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            // Check if the output matches the expected output
            results.push({
                input: testCase.input,
                expected_output: testCase.output,
                actual_output: submissionResult.stdout,
                success: submissionResult.stdout === testCase.output
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
