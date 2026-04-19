// server/routes/bids/bidAnalytics.routes.js
const express = require('express');
const router = express.Router();
const { getMyBidAnalytics } = require('../../controllers/bids/bidAnalytics.controller');
const { protect, isFreelancer } = require('../../middleware/authMiddleware');

// GET /api/bids/analytics — stats for current freelancer
router.get(
  '/analytics',
  protect,
  isFreelancer,
  getMyBidAnalytics
);

module.exports = router;
