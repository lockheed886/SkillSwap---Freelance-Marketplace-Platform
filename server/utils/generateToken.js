// server/utils/generateToken.js
const jwt = require('jsonwebtoken');
// Removed require('dotenv').config() here, should be loaded globally in server.js

const generateToken = (userId, role) => {
    // --- Add this console log ---
    console.log('JWT Secret Used:', process.env.JWT_SECRET);
    // --- End of console log ---

    if (!process.env.JWT_SECRET) {
         console.error("ERROR: JWT_SECRET is not defined in environment variables!");
         // You might want to throw an error here in production
         // throw new Error("JWT Secret configuration error.");
         // For now, log and potentially return null or let jwt.sign fail
    }

    return jwt.sign(
        { userId, role },
        process.env.JWT_SECRET, // Error originates here if this is undefined/empty
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );
};

module.exports = generateToken;