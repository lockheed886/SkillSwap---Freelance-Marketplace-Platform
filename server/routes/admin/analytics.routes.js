// server/routes/admin/analytics.routes.js
const express = require('express');
const router = express.Router();
const {
  getProjectAnalytics,
  getFreelancerAnalytics,
  getUserGrowthAnalytics,
  getPopularSkillsAnalytics,
  getTransactionAnalytics,
  getRevenueAnalytics,
  exportAnalytics
} = require('../../controllers/admin/analyticsController');
const { protect, isAdmin } = require('../../middleware/authMiddleware');

router.use(protect, isAdmin);

// Basic analytics
router.get('/projects', getProjectAnalytics);
router.get('/freelancers', getFreelancerAnalytics);

// Enhanced analytics
router.get('/user-growth', getUserGrowthAnalytics);
router.get('/popular-skills', getPopularSkillsAnalytics);
router.get('/transactions', getTransactionAnalytics);
router.get('/revenue', getRevenueAnalytics);

// Export functionality
router.get('/export', exportAnalytics);

module.exports = router;
