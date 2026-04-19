// server/routes/freelancers/profile.routes.js
const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile
} = require('../../controllers/freelancers/profile.controller');
const { protect, isFreelancer } = require('../../middleware/authMiddleware');

router.use(protect, isFreelancer);

router
  .route('/profile')
  .get(getProfile)
  .put(updateProfile);

module.exports = router;
