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

// Create a new contest
const createContest = async (req, res) => {
    const { contestName, problems } = req.body;
    try {
        const newContest = new Contest({
            contestName,
            problems
        });
        await newContest.save();
        res.status(201).json(newContest);
    } catch (err) {
        res.status(500).json({ message: 'Error creating contest', error: err });
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
    registerForContest,
    attemptContest
};
