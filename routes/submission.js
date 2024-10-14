// // routes/submissions.js
// const express = require('express');
// const router = express.Router();
// const axios = require('axios');
// const Problem = require('../models/Problem');
// const Code = require('../models/Code'); // Import Code model if needed

// // Judge0 API URL and key (you need to sign up at Judge0 to get the key)
// const JUDGE0_API_URL = 'https://judge0-ce.p.rapidapi.com';
// const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY;

// // Submit code for a problem
// router.post('/:id/submit', async (req, res) => {
//     const { userCode, language } = req.body; // The function code submitted by the user and the language
//     const problemId = req.params.id;

//     try {
//         const problem = await Problem.findById(problemId).populate('code'); // Populate code references
//         if (!problem) return res.status(404).json({ msg: 'Problem not found' });

//         // Find the code entry for the requested language
//         const codeEntry = problem.code.find((c) => c.language === language);
//         if (!codeEntry) {
//             return res.status(404).json({ msg: `Code entry for language ${language} not found` });
//         }

//         // Concatenate preCode, user code, and postCode
//         const completeCode = `${codeEntry.preCode}\n${userCode}\n${codeEntry.postCode}`;

//         const results = [];

//         // Loop through each sample test case
//         for (const testCase of problem.sampleTestCases) {
//             // Send code to Judge0 API for evaluation
//             const submissionResponse = await axios.post(`${JUDGE0_API_URL}/submissions?base64_encoded=false`, {
//                 source_code: completeCode,
//                 language_id: codeEntry.languageId, // Assuming you have a mapping for language IDs
//                 stdin: testCase.input,
//                 expected_output: testCase.output
//             }, {
//                 headers: {
//                     'x-rapidapi-key': JUDGE0_API_KEY,
//                     'Content-Type': 'application/json'
//                 }
//             });

//             const submissionResult = submissionResponse.data;
//             results.push({
//                 input: testCase.input,
//                 expected_output: testCase.output,
//                 actual_output: submissionResult.output,
//                 success: submissionResult.output === testCase.output
//             });
//         }

//         // Check if all sample test cases passed
//         const allSamplePassed = results.every(result => result.success);

//         if (allSamplePassed) {
//             // Now, loop through all other test cases
//             const otherTestCases = problem.testCases; // Assuming these are the IDs for other test cases
//             const otherResults = [];

//             for (const testCaseId of otherTestCases) {
//                 const testCase = await TestCase.findById(testCaseId); // Assuming TestCase model is defined
//                 if (!testCase) continue; // If test case not found, skip

//                 // Send code to Judge0 API for evaluation
//                 const submissionResponse = await axios.post(`${JUDGE0_API_URL}/submissions?base64_encoded=false`, {
//                     source_code: completeCode,
//                     language_id: codeEntry.languageId,
//                     stdin: testCase.input,
//                     expected_output: testCase.output
//                 }, {
//                     headers: {
//                         'x-rapidapi-key': JUDGE0_API_KEY,
//                         'Content-Type': 'application/json'
//                     }
//                 });

//                 const submissionResult = submissionResponse.data;
//                 otherResults.push({
//                     input: testCase.input,
//                     expected_output: testCase.output,
//                     actual_output: submissionResult.output,
//                     success: submissionResult.output === testCase.output
//                 });
//             }

//             res.json({ results, otherResults }); // Return results of both sample and other test cases
//         } else {
//             res.json({ results }); // Return results for sample test cases only
//         }
//     } catch (err) {
//         console.error(err); // Log the error for debugging
//         res.status(500).json({ error: 'Server Error' });
//     }
// });

// module.exports = router;
