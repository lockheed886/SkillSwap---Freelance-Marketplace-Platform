// server/routes/auth.routes.js
const express = require('express');
const {
    registerUser,
    loginUser,
    verifyEmail,
    requestPasswordReset,
    resetPassword
} = require('../../controllers/auth/auth.Controller'); // Ensure path is correct

const router = express.Router();

router.post('/signup', registerUser);
router.post('/login', loginUser);

// Placeholder routes for verification and password reset
// router.get('/verify/email/:token', verifyEmail); // Example for email verification link
// router.post('/request-reset-password', requestPasswordReset);
// router.post('/reset-password/:token', resetPassword);

module.exports = router;