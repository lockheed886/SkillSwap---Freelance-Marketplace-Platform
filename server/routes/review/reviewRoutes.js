// server/routes/review/reviewRoutes.js

const express = require('express');
const {
  createReview,
  getFreelancerReviews,
  respondToReview
} = require('../../controllers/review/reviewController');
const { protect, isFreelancer } = require('../../middleware/authMiddleware');
const router = express.Router();

// POST   /api/reviews                → Create review (any authenticated user)
router.post('/', protect, createReview);

// GET    /api/reviews/freelancer/:freelancerId
router.get('/freelancer/:freelancerId', getFreelancerReviews);

// PUT    /api/reviews/:reviewId/response
router.put('/:reviewId/response', protect, isFreelancer, respondToReview);

module.exports = router;
