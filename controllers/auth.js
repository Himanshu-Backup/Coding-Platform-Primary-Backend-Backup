const crypto = require('crypto')
const secretKey = process.env.secretKey;
const User = require('../models/User')
const jwt = require('jsonwebtoken');

const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;

module.exports.register = async (req, res) => {
    const { username, email, password, captchaValue } = req.body
    if (!captchaValue) {
        return res.status(400).json({ error: "CAPTCHA is required!" });
    }

    try {
        const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET_KEY}&response=${captchaValue}`;

        const { data2 } = await axios.post(verifyUrl);
        console.log(data2);
        if (!data2.success) {
            return res.status(400).json({ error: "CAPTCHA verification failed!" });
        }

        const user = new User({ username, email, password })
        const resp = await user.save()

        // Log the saved user document
        console.log('User saved:', resp);

        const data = {
            user: { id: user._id }
        }
        // console.log(process.env.SECRET);
        res.status(201).json({ success: true, user: resp })
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }


}


module.exports.login = async (req, res) => {
    const { email, password, captchaValue } = req.body;
    if (!captchaValue) {
        return res.status(400).json({ error: "CAPTCHA is required!" });
    }
    try {
        const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET_KEY}&response=${captchaValue}`;

        const { data2 } = await axios.post(verifyUrl);
        console.log(data2);
        if (!data2.success) {
            return res.status(400).json({ error: "CAPTCHA verification failed!" });
        }
        // Find the user by email
        const foundUser = await User.findOne({ email });
        if (!foundUser) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

        // Compare the password with the hashed password in the database
        const isMatch = await foundUser.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

        // Generate JWT token
        const data = {
            user: { id: foundUser._id }
        };
        const authToken = jwt.sign(data, secretKey, { expiresIn: '1h' });

        res.status(200).json({ success: true, authToken });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

//Get Profile
module.exports.getProfile = async (req, res) => {
    try {
        // Find the user by the ID present in the request object (set by fetchUser middleware)
        const user = await User.findById(req.user.id)
            .populate('problemsCompleted', 'title') // Populate 'problemsCompleted' with the 'title' field from the Problem model
            .select('username email problemsCompleted'); // Select only the necessary fields from the user

        // If the user does not exist
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Map over the populated problemsCompleted array and extract title and problemId
        const completedProblems = user.problemsCompleted.map(problem => ({
            problemId: problem._id, // Problem ID
            title: problem.title // Problem title
        }));

        // Send the response with username, email, and problems solved
        return res.json({
            username: user.username,
            email: user.email,
            problemsCompleted: completedProblems
        });

    } catch (error) {
        console.error('Error fetching user profile:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

