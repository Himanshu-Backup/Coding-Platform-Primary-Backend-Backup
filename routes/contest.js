const express = require('express');
const router = express.Router();
const { getContests, createContest, registerForContest, attemptContest } = require('../controllers/contestController');
const { protect } = require('../middlewares/authMiddleware');

// Route to get all contests
router.get('/', getContests);

// Route to create a new contest
router.post('/createContest', createContest);

// Protected route: Register a user for a contest
router.post('/register', protect, registerForContest);

// Protected route: Attempt a contest (must be registered)
router.get('/attempt/:contestId', protect, attemptContest);

module.exports = router;
