// const jwt = require('jsonwebtoken');
// const User = require('../models/User');

// // Middleware to protect routes
// const protect = async (req, res, next) => {
//     let token;
//     if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
//         try {
//             token = req.headers.authorization.split(' ')[1];
//             const decoded = jwt.verify(token, process.env.JWT_SECRET);
//             req.user = await User.findById(decoded.id).select('-password');
//             next();
//         } catch (err) {
//             res.status(401).json({ message: 'Not authorized, token failed' });
//         }
//     }
//     if (!token) {
//         res.status(401).json({ message: 'Not authorized, no token' });
//     }
// };

// module.exports = { protect };


require('dotenv').config()
const secretKey = process.env.secretKey
const jwt = require('jsonwebtoken');
module.exports.fetchUser = (req, res, next) => {
    // Get user from jwt token and add id to req object
    const token = req.headers.authorization.split(' ')[1];
    // console.log(token);
    if (!token) {
        return res.status(401).json({ message: 'Authorization required' });
    }

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            console.error(err);
            return res
                .status(401)
                .json({ message: 'Invalid token', error: err.message });
        }

        // Token is valid, you can access the user's data from 'decoded'
        req.user = decoded.user;
        // console.log(decoded);
        console.log(req.user);

        next();
    })
}