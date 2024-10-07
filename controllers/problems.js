//Create a Problem
const Problem = require('../models/Problem');
const TestCase = require('../models/TestCase');
const Code = require('../models/Code');

module.exports.createProblem = async (req, res) => {
    try {
        // 1. Create the problem
        const { title, description, sampleTestCases } = req.body;
        const newProblem = new Problem({ title, description, sampleTestCases });
        const savedProblem = await newProblem.save();

        res.status(201).json({ success: true, problem: savedProblem });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error creating problem" });
    }
};

module.exports.createTestCase = async (req, res) => {
    try {
        const testCases = req.body;  // Expecting the entire array of test cases

        if (!testCases || !Array.isArray(testCases) || testCases.length === 0) {
            return res.status(400).json({ success: false, message: "No test cases provided" });
        }

        const createdTestCases = [];

        // Loop over each test case in the array and save it
        for (const testCase of testCases) {
            const { input, output, problemId } = testCase;

            // Create and save a new test case
            const newTestCase = new TestCase({ input, output, problemId });
            const savedTestCase = await newTestCase.save();
            createdTestCases.push(savedTestCase._id);
        }

        // Update the problem with the new test case IDs
        const uniqueProblemId = testCases[0].problemId; // Assuming all test cases belong to the same problem
        await Problem.findByIdAndUpdate(uniqueProblemId, { $push: { testCases: { $each: createdTestCases } } });

        res.status(201).json({ success: true, testCases: createdTestCases });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error creating test cases" });
    }
};

//Create code
module.exports.createCode = async (req, res) => {
    try {
        const codes = req.body; // Expecting the entire array of code entries

        if (!codes || !Array.isArray(codes) || codes.length === 0) {
            return res.status(400).json({ success: false, message: "No code entries provided" });
        }

        const createdCodeEntries = [];

        // Loop over each code entry in the array and save it
        for (const code of codes) {
            const { language, preCode, postCode, solutionCode, problemId } = code;

            // Create and save a new code entry
            const newCode = new Code({ language, preCode, postCode, solutionCode, problemId });
            const savedCode = await newCode.save();
            createdCodeEntries.push(savedCode._id);
        }

        // Update the problem with the new code IDs
        const uniqueProblemId = codes[0].problemId; // Assuming all code entries belong to the same problem
        await Problem.findByIdAndUpdate(uniqueProblemId, { $push: { code: { $each: createdCodeEntries } } });

        res.status(201).json({ success: true, codes: createdCodeEntries });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error creating code entries" });
    }
};



//Get problem with a ID
module.exports.getProblemWithId = async (req, res) => {
    try {
        const problem = await Problem.findById(req.params.id)
            .populate('testCases')  // Populate test cases
            .populate('code');      // Populate code

        if (!problem) return res.status(404).json({ msg: 'Problem not found' });

        res.json(problem);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
};


//Get all problems
module.exports.getAllProblems = async (req, res) => {
    try {
        const problems = await Problem.find({})
            .populate('testCases')  // Populate test cases for each problem
            .populate('code');      // Populate code for each problem

        if (!problems || problems.length === 0) return res.status(404).json({ msg: 'No problems found' });

        res.json(problems);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
};

