const express = require('express');
const router = express.Router();
const { getContests, createContest, updateContest, registerForContest, attemptContest } = require('../controllers/contestController');
const { protect } = require('../middlewares/authMiddleware');

// Route to get all contests
router.get('/', getContests);

// Route to create a new contest (with just the name)
router.post('/createContest', createContest);

// Route to update a contest by adding problems (requires contest ID)
router.put('/updateContest/:id', updateContest);

// Protected route: Register a user for a contest
router.post('/register', protect, registerForContest);

// Protected route: Attempt a contest (must be registered)
router.get('/attempt/:contestId', protect, attemptContest);

module.exports = router;
