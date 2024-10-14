const Problem = require('../models/Problem');
const ProblemTestCaseMapping = require('../models/ProblemTestCaseMapping');
const ProblemLanguageMapping = require('../models/ProblemLanguageMapping');
const ProblemLanguageCodeMapping = require('../models/ProblemLanguageCodeMapping');

// Get all problems (only titles and ids)
const getProblems = async (req, res) => {
    try {
        const problems = await Problem.find({}, 'title _id');
        res.status(200).json(problems);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching problems', error: err });
    }
};

// Create a new problem
const createProblem = async (req, res) => {
    const { title, description, sampleTestCases } = req.body;
    try {
        const newProblem = new Problem({
            title,
            description,
            sampleTestCases
        });
        await newProblem.save();
        res.status(201).json(newProblem);
    } catch (err) {
        res.status(500).json({ message: 'Error creating problem', error: err });
    }
};

//Updating a problem
const updateProblem = async (req, res) => {
    const { id } = req.params;  // problem ID from the route
    const { title, description, sampleTestCases } = req.body;  // Fields to update

    try {
        // Find the problem by its ID
        let problem = await Problem.findById(id);
        if (!problem) {
            return res.status(404).json({ message: 'Problem not found' });
        }

        // Update the problem title if provided
        if (title) {
            problem.title = title;
        }

        // Update the problem description if provided
        if (description) {
            problem.description = description;
        }

        // If sampleTestCases is provided, update them accordingly
        if (sampleTestCases) {
            // Check if there are exactly two sample test cases
            if (sampleTestCases.length === 2) {
                problem.sampleTestCases = sampleTestCases;  // Overwrite both test cases
            } else if (sampleTestCases.length === 1) {
                // Check if only one test case is provided (e.g., user wants to update one of the two)
                const [updatedTestCase] = sampleTestCases;

                // Update individual test cases if their index is provided (0 or 1)
                if (updatedTestCase.index === 0) {
                    problem.sampleTestCases[0] = updatedTestCase;  // Update the first test case
                } else if (updatedTestCase.index === 1) {
                    problem.sampleTestCases[1] = updatedTestCase;  // Update the second test case
                }
            }
        }

        // Save the updated problem to the database
        await problem.save();
        res.status(200).json({ message: 'Problem updated successfully', problem });
    } catch (err) {
        res.status(500).json({ message: 'Error updating problem', error: err });
    }
};


// Create a test case for a specific problem
const createTestCase = async (req, res) => {
    const { problemID, input, output } = req.body;
    try {
        const newTestCase = new ProblemTestCaseMapping({
            problemID,
            input,
            output
        });
        await newTestCase.save();
        res.status(201).json(newTestCase);
    } catch (err) {
        res.status(500).json({ message: 'Error creating test case', error: err });
    }
};

// Create language mapping for a problem
const createProblemLanguageMapping = async (req, res) => {
    const { problemID, language } = req.body;
    try {
        const newMapping = new ProblemLanguageMapping({
            problemID,
            language
        });
        await newMapping.save();
        res.status(201).json(newMapping);
    } catch (err) {
        res.status(500).json({ message: 'Error creating language mapping', error: err });
    }
};

// Get problem details for attempting
const getProblemDetails = async (req, res) => {
    const { problemId } = req.params;
    try {
        const problem = await Problem.findById(problemId)
            .populate('testCases')
            .populate('problemLanguageMapping');
        res.status(200).json(problem);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching problem details', error: err });
    }
};

// Create code mapping for a problem language
const createProblemLanguageCodeMapping = async (req, res) => {
    const { problemLanguageMappingID, preCode, postCode, solutionCode, boilerplateCode } = req.body;
    try {
        const newMapping = new ProblemLanguageCodeMapping({
            problemLanguageMappingID,
            preCode,
            postCode,
            solutionCode,
            boilerplateCode
        });
        await newMapping.save();
        res.status(201).json(newMapping);
    } catch (err) {
        res.status(500).json({ message: 'Error creating code mapping', error: err });
    }
};

module.exports = {
    getProblems,
    createProblem,
    updateProblem,
    createTestCase,
    createProblemLanguageMapping,
    getProblemDetails,
    createProblemLanguageCodeMapping
};
