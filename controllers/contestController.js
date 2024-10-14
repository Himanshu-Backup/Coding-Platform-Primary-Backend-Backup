const Contest = require('../models/Contest');
const User = require('../models/User');

// Get all contests (name and number of problems)
const getContests = async (req, res) => {
    try {
        const contests = await Contest.find({}, 'contestName problems');
        const contestsWithProblemCount = contests.map(contest => ({
            contestName: contest.contestName,
            numberOfProblems: contest.problems.length
        }));
        res.status(200).json(contestsWithProblemCount);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching contests', error: err });
    }
};

const createContest = async (req, res) => {
    const { contestName } = req.body;
    try {
        const newContest = new Contest({
            contestName,
            problems: []  // Initially, no problems will be added
        });
        await newContest.save();
        res.status(201).json(newContest);
    } catch (err) {
        res.status(500).json({ message: 'Error creating contest', error: err });
    }
};

// Update a contest to add problems (by contest ID)
const updateContest = async (req, res) => {
    const { id } = req.params;
    const { problemIds } = req.body;  // List of problem IDs to add to the contest

    try {
        // Fetch the contest by its ID
        const contest = await Contest.findById(id);
        if (!contest) {
            return res.status(404).json({ message: 'Contest not found' });
        }

        // Validate that all provided problem IDs exist
        const validProblems = await Problem.find({ _id: { $in: problemIds } });
        if (validProblems.length !== problemIds.length) {
            return res.status(400).json({ message: 'Some problem IDs are invalid' });
        }

        // Add problems to the contest (if they are not already added)
        validProblems.forEach(problem => {
            if (!contest.problems.includes(problem._id)) {
                contest.problems.push(problem._id);
            }
        });

        // Save the updated contest
        await contest.save();
        res.status(200).json({ message: 'Problems added to contest successfully', contest });
    } catch (err) {
        res.status(500).json({ message: 'Error updating contest', error: err });
    }
};

// Register a user for a contest
const registerForContest = async (req, res) => {
    const { userId, contestId } = req.body;
    try {
        const contest = await Contest.findById(contestId);
        if (!contest.users.includes(userId)) {
            contest.users.push(userId);
            await contest.save();
            res.status(200).json({ message: 'User registered for contest' });
        } else {
            res.status(400).json({ message: 'User already registered for contest' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Error registering user for contest', error: err });
    }
};

// Get problems in a contest (must be registered)
const attemptContest = async (req, res) => {
    const { contestId } = req.params;
    const userId = req.user.id; // Assuming `user` is set in auth middleware
    try {
        const contest = await Contest.findById(contestId).populate('problems');
        if (contest.users.includes(userId)) {
            res.status(200).json(contest.problems);
        } else {
            res.status(403).json({ message: 'User not registered for contest' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Error fetching contest problems', error: err });
    }
};

module.exports = {
    getContests,
    createContest,
    updateContest,
    registerForContest,
    attemptContest
};
