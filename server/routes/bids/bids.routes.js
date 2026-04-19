// server/routes/bids/bids.routes.js
const express = require('express');
const {
  submitBid,
  getBidsForProject,
  updateBid,
  withdrawBid,
  respondToCounterOffer,
  getProjectBidAnalytics,   // ← make sure this is imported
} = require('../../controllers/bids/bid.controller');
const { protect, isFreelancer, isClient } = require('../../middleware/authMiddleware');

const router = express.Router({ mergeParams: true });

router.use(protect);

// Freelancer submits
router.post('/', isFreelancer, submitBid);

// Client lists bids
router.get('/', isClient, getBidsForProject);

// ← NEW analytics route
router.get('/analytics', isClient, getProjectBidAnalytics);

// Client updates / counter-offer
router.put('/:bidId', isClient, updateBid);

// Freelancer withdraws
router.delete('/:bidId', isFreelancer, withdrawBid);

// Freelancer responds to counter-offer
router.put('/:bidId/respond-counter', isFreelancer, respondToCounterOffer);

module.exports = router;
