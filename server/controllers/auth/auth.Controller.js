// server/controllers/auth/auth.controller.js
const User = require('../../models/User');
const generateToken = require('../../utils/generateToken');
const asyncHandler = require('express-async-handler');

// @desc    Register a new user (Client, Freelancer, or Admin)
// @route   POST /api/auth/signup
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, role = 'client' } = req.body; // Default role to 'client' if not provided

    // Basic validation
    if (!name || !email || !password) {
        res.status(400);
        throw new Error('Please provide name, email, and password');
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists with this email');
    }

    // Validate role --- MODIFIED ---
    const allowedRoles = ['client', 'freelancer', 'admin']; // <-- Added 'admin' here
    if (!allowedRoles.includes(role)) {
        res.status(400);
        // Updated error message to reflect allowed roles
        throw new Error(`Invalid role specified. Allowed roles are: ${allowedRoles.join(', ')}`);
    }

    // Create user (password hashing handled by model's pre-save hook)
    const user = await User.create({
        name,
        email,
        password,
        role, // Role from request body ('client', 'freelancer', or 'admin') is now used
        // Set sensible defaults for admin upon creation if needed,
        // otherwise rely on schema defaults. E.g., admin might be instantly verified.
        isEmailVerified: role === 'admin' ? true : false, // Example: Auto-verify admin email for simplicity
        // Add other fields or default overrides specific to admin signup if necessary
    });

    if (user) {
        // **TODO:** Implement email/phone verification initiation here for client/freelancer
        // (e.g., generate verification token, send email/SMS) - Skip for admin if auto-verified

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            // Modify message based on verification flow/role
            message: role === 'admin' ? 'Admin registration successful.' : 'Registration successful. Please check your email/phone for verification.'
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400);
        throw new Error('Please provide email and password');
    }

    // Check for user by email
    const user = await User.findOne({ email });

    // Check user and password
    if (user && (await user.comparePassword(password))) {

        // Optional Verification Check (Consider if admins need verification)
        // if (user.role !== 'admin' && !user.isEmailVerified && !user.isPhoneVerified) {
        //     res.status(401);
        //     throw new Error('Account not verified. Please check your email/phone.');
        // }

        // Check if account is active
        if (!user.isActive) { // Good to keep this check for all roles
            res.status(403);
            throw new Error('Account is suspended. Please contact support.');
        }

        // Generate token
        const token = generateToken(user._id, user.role);

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: token, // Send token to client
        });
    } else {
        res.status(401); // Unauthorized
        throw new Error('Invalid email or password');
    }
});

// --- Placeholder functions for other auth routes ---
// (verifyEmail, requestPasswordReset, resetPassword remain the same for now)

// @desc    Verify Email (Placeholder)
const verifyEmail = asyncHandler(async (req, res) => { /* ... */ });

// @desc    Request Password Reset (Placeholder)
const requestPasswordReset = asyncHandler(async (req, res) => { /* ... */ });

// @desc    Reset Password (Placeholder)
const resetPassword = asyncHandler(async (req, res) => { /* ... */ });


module.exports = {
    registerUser,
    loginUser,
    verifyEmail,
    requestPasswordReset,
    resetPassword,
};