// server/routes/admin/verification.routes.js
const express = require('express');
const router = express.Router();
const {
  getPendingVerifications,
  getFreelancersByVerificationStatus,
  getFreelancerVerificationDetails,
  updateVerificationStatus
} = require('../../controllers/admin/verificationController');
const { protect, isAdmin } = require('../../middleware/authMiddleware');

// Apply middleware to all routes
router.use(protect, isAdmin);

// Get all freelancers with pending verification
router.get('/pending', getPendingVerifications);

// Get all freelancers by verification status
router.get('/', getFreelancersByVerificationStatus);

// Get freelancer details with verification documents
router.get('/:freelancerId', getFreelancerVerificationDetails);

// Update freelancer verification status
router.put('/:freelancerId', updateVerificationStatus);

module.exports = router;
