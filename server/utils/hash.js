// server/utils/hash.js
// Example for future use (e.g., SHA-256)
const crypto = require('crypto');

const hashDataSHA256 = (data) => {
    return crypto.createHash('sha256').update(data).digest('hex');
};

// bcrypt hashing is handled directly in User model or auth controller

module.exports = {
    hashDataSHA256,
    // No bcrypt functions needed here if using model hook & compare method
};