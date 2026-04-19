// server/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

const protect = asyncHandler(async (req, res, next) => {
    let token;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer')) {
        try {
            // Get token from header
            token = authHeader.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from the token (excluding password)
            req.user = await User.findById(decoded.userId).select('-password');

            if (!req.user) {
                 res.status(401);
                 throw new Error('Not authorized, user not found');
            }
            if (!req.user.isActive) {
                res.status(403);
                throw new Error('Not authorized, account suspended');
            }

            next(); // Proceed to the next middleware/controller
        } catch (error) {
            console.error('Token verification failed:', error);
            res.status(401); // Unauthorized
            throw new Error('Not authorized, token failed');
        }
    }

    if (!token) {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
});

// Optional: Role-specific middleware
const isClient = (req, res, next) => {
    if (req.user && req.user.role === 'client') {
        next();
    } else {
        res.status(403); // Forbidden
        throw new Error('Not authorized as a client');
    }
};

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403); // Forbidden
        throw new Error('Not authorized as an admin');
    }
};
const isFreelancer = (req, res, next) => {
    // Ensure protect middleware ran first and set req.user
    if (req.user && req.user.role === 'freelancer') {
        next();
    } else {
        res.status(403); // Forbidden
        throw new Error('Not authorized as a freelancer');
    }
};

module.exports = { protect, isClient, isAdmin, isFreelancer };