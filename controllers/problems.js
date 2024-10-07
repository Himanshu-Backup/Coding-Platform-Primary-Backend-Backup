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
        const { input, output, problemId } = req.body;

        const newTestCase = new TestCase({ input, output, problemId });
        const savedTestCase = await newTestCase.save();

        // Find and update the problem with the new test case
        await Problem.findByIdAndUpdate(problemId, { $push: { testCases: savedTestCase._id } });

        res.status(201).json({ success: true, testCase: savedTestCase });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error creating test case" });
    }
};

module.exports.createCode = async (req, res) => {
    try {
        const { language, preCode, postCode, solutionCode, problemId } = req.body;

        const newCode = new Code({ language, preCode, postCode, solutionCode, problemId });
        const savedCode = await newCode.save();

        // Find and update the problem with the new code entry
        await Problem.findByIdAndUpdate(problemId, { $push: { code: savedCode._id } });

        res.status(201).json({ success: true, code: savedCode });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error creating code" });
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

