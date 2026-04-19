// server/routes/freelancers.routes.js
const express = require('express');
const router = express.Router();
const {
  getFreelancers,
  getMyProfile,
  updateMyProfile,
} = require('../../controllers/freelancers/freelancer.controller');
const { protect, isFreelancer } = require('../../middleware/authMiddleware');

// Public: search
router.get('/', getFreelancers);

// Private: own profile
router
  .route('/profile')
  .get(protect, isFreelancer, getMyProfile)
  .put(protect, isFreelancer, updateMyProfile);

module.exports = router;
