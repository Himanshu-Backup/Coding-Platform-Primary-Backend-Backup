const Problem = require('../models/Problem');
const ProblemTestCaseMapping = require('../models/ProblemTestCaseMapping');
const ProblemLanguageMapping = require('../models/ProblemLanguageMapping');
const ProblemLanguageCodeMapping = require('../models/ProblemLanguageCodeMapping');
const axios = require('axios');
const { propfind } = require('../routes/auth');
const User = require("../models/User")
const jwt = require('jsonwebtoken');
// Load environment variables from .env
require('dotenv').config();

const secretKey = process.env.secretKey


const JUDGE0_API_URL = process.env.JUDGE0_API_URL;
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY;

const LANGUAGE_IDS = {
    "C++": 54,
    "Java": 91,
    "Python": 71,
    "Javascript": 93
};

const createSubmissionAndFetchResult = async (source_code, language_id, _stdin, expected_output) => {
    try {
        const options = {
            method: 'POST',
            url: 'https://judge0-ce.p.rapidapi.com/submissions',
            params: {
                base64_encoded: 'true',
                wait: 'false',
                fields: '*'
            },
            headers: {
                'x-rapidapi-key': '908dd6c3a9mshcfeebef6564f291p181ca8jsnf1a23bba0dd1',
                'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
                'Content-Type': 'application/json'
            },
            data: {
                language_id: language_id,
                source_code: btoa(source_code),
                stdin: btoa(_stdin),
                expected_output: btoa(expected_output)
            }
        };


        const submissionResponse = await axios.request(options);;
        // console.log(submissionResponse.data);

        if (!submissionResponse.data.token) {
            throw new Error('Submission failed');
        }

        const token = submissionResponse.data.token;
        console.log(token);

        // console.log(submissionResponse.data)
        // Step 2: Poll the result using the token (GET request)
        let submissionResult;
        let status;

        do {
            const axios = require('axios');
            const xkey = process.env.JUDGE0_API_KEY;
            const xhost = process.env.JUDGE0_API_URL;
            const getOptions = {
                method: 'GET',
                url: `https://${xhost}/submissions/${token}`,
                params: {
                    base64_encoded: 'true',
                    fields: '*'
                },
                headers: {
                    'x-rapidapi-key': `${xkey}`,
                    'x-rapidapi-host': `${xhost}`
                }
            };

            submissionResult = await axios.request(getOptions);
            // console.log(submissionResult.data);
            status = submissionResult.data.status.id;

            // Sleep for a while to avoid hitting the API too often
            await new Promise(resolve => setTimeout(resolve, 1000));

        } while (status <= 2); // Status 1 = "In Queue", Status 2 = "Processing"

        console.log(submissionResult.data);

        // Step 3: Return the final result
        return submissionResult.data;

    } catch (err) {
        console.error('Error creating or fetching submission:', err);
        throw err;
    }
};

// Handles code submission by a user
const handleSubmission = async (req, res) => {
    const { userCode, language } = req.body;
    const problemId = req.params.id;

    try {
        // Fetch problem and mappings
        const problem = await Problem.findById(problemId)
            .populate({
                path: 'problemLanguageMapping',
                populate: { path: 'problemLanguageCodeMapping' }
            })
            .populate('testCases');
        if (!problem) return res.status(404).json({ msg: 'Problem not found' });

        const languageMapping = await ProblemLanguageMapping.findOne({ problemID: problemId, language });
        // if (!languageMapping) {
        //     return res.status(404).json({ msg: `No language mapping found for ${language}` });
        // }

        // const codeMapping = await ProblemLanguageCodeMapping.findOne({ problemLanguageMappingID: languageMapping._id });
        // if (!codeMapping) {
        //     return res.status(404).json({ msg: `No code mappings found for the selected language: ${language}` });
        // }

        // const completeCode = `${codeMapping.preCode}\n${userCode}\n${codeMapping.postCode}`;
        // const results = [];
        // console.log(completeCode);

        let completeCode = '';
        if (languageMapping) {
            const codeMapping = await ProblemLanguageCodeMapping.findOne({ problemLanguageMappingID: languageMapping._id });
            if (codeMapping) {
                completeCode = `${codeMapping.preCode}\n${userCode}\n${codeMapping.postCode}`;
            } else {
                completeCode = `${userCode}`;
            }
        } else {
            completeCode = `${userCode}`;
        }
        console.log(completeCode)
        const results = [];

        // Iterate through sample test cases
        for (const testCase of problem.sampleTestCases) {
            const result = await createSubmissionAndFetchResult(
                completeCode,
                LANGUAGE_IDS[language],
                testCase.input,
                testCase.output
            );

            results.push({
                input: testCase.input,
                expected_output: testCase.output,
                actual_output: result.stdout,
                success: atob(result.stdout) === testCase.output,
                status: result.status.description
            });
        }

        const allSamplePassed = results.every(result => result.success);

        if (allSamplePassed) {
            const otherResults = [];
            for (const testCaseId of problem.testCases) {
                const testCase = await ProblemTestCaseMapping.findById(testCaseId);
                if (!testCase) continue;

                const result = await createSubmissionAndFetchResult(
                    completeCode,
                    LANGUAGE_IDS[language],
                    testCase.input,
                    testCase.output
                );

                results.push({
                    input: testCase.input,
                    expected_output: testCase.output,
                    actual_output: result.stdout,
                    success: atob(result.stdout) === testCase.output,
                    status: result.status.description
                });
            }

            const authHeader = req.headers.authorization;

            if (authHeader) {
                const token = authHeader.split(' ')[1]; // Extract token
                console.log("Got the token");
                console.log(token);

                if (token) {
                    try {
                        // const decoded = jwt.verify(token, secretKey); // Verify token with secret key
                        // const userId = decoded.id; // Assuming the token contains the user ID

                        jwt.verify(token, secretKey, (err, decoded) => {
                            if (err) {
                                console.error(err);
                            } else {
                                req.user = decoded.user;
                                // console.log(decoded);
                                console.log(req.user);
                            }
                        })

                        // Find user and update solvedProblems
                        const user = await User.findById(req.user.id)

                        if (user) {
                            user.problemsCompleted.push(problemId); // Update user's solved problems
                            await user.save(); // Save changes to the database
                        }
                    } catch (error) {
                        console.error('Invalid token:', error);
                    }
                }
            } else {
                console.log('No authentication token found in headers.');
            }


            res.json({ results });
        } else {
            res.json({ results });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Handles "Run" operation without validating all test cases
const handleRun = async (req, res) => {
    const { userCode, language } = req.body;
    console.log(userCode);
    const problemId = req.params.id;

    try {
        const problem = await Problem.findById(problemId)
            .populate({
                path: 'problemLanguageMapping',
                populate: { path: 'problemLanguageCodeMapping' }
            });
        if (!problem) return res.status(404).json({ msg: 'Problem not found' });
        console.log(problem)

        // res.status(201).json({ "problem": problem })
        const languageMapping = await ProblemLanguageMapping.findOne({ problemID: problemId, language });
        // if (!languageMapping) {
        //     return res.status(404).json({ msg: `No language mapping found for ${language}` });
        // }

        // const codeMapping = await ProblemLanguageCodeMapping.findOne({ problemLanguageMappingID: languageMapping._id });
        // if (!codeMapping) {
        //     return res.status(404).json({ msg: `No code mappings found for the selected language: ${language}` });
        // }

        // const completeCode = `${codeMapping.preCode}\n${userCode}\n${codeMapping.postCode}`;

        let completeCode = '';
        if (languageMapping) {
            const codeMapping = await ProblemLanguageCodeMapping.findOne({ problemLanguageMappingID: languageMapping._id });
            if (codeMapping) {
                completeCode = `${codeMapping.preCode}\n${userCode}\n${codeMapping.postCode}`;
            } else {
                completeCode = `${userCode}`;
            }
        } else {
            completeCode = `${userCode}`;
        }
        console.log(completeCode)
        const results = [];

        for (const testCase of problem.sampleTestCases) {
            const result = await createSubmissionAndFetchResult(
                completeCode,
                LANGUAGE_IDS[language],
                testCase.input,
                testCase.output
            );

            results.push({
                input: testCase.input,
                expected_output: testCase.output,
                actual_output: atob(result.stdout),
                success: atob(result.stdout) === testCase.output,
                status: result.status.description
            });
        }

        res.json({ results });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    handleSubmission,
    handleRun
};