// server/controllers/review/reviewController.js

const Review = require('../../models/Review');

exports.createReview = async (req, res) => {
  try {
    const { projectId, freelancerId, rating, comment } = req.body;
    if (!projectId || !freelancerId || !rating) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const reviewerId = req.user._id;
    const already = await Review.findOne({ projectId, reviewerId });
    if (already) {
      return res.status(400).json({ message: 'You have already reviewed this project.' });
    }

    const review = new Review({ projectId, freelancerId, reviewerId, rating, comment });
    await review.save();
    res.status(201).json(review);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getFreelancerReviews = async (req, res) => {
  try {
    const { freelancerId } = req.params;
    const { rating, sortBy = 'createdAt', order = 'desc' } = req.query;

    const filter = { freelancerId };
    if (rating) filter.rating = Number(rating);

    const reviews = await Review.find(filter)
      .populate('reviewerId', 'name avatar')
      .sort({ [sortBy]: order === 'asc' ? 1 : -1 });

    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.respondToReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { response } = req.body;
    const freelancerId = req.user._id.toString();

    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    if (review.freelancerId.toString() !== freelancerId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    review.response = response;
    review.responseAt = new Date();
    await review.save();
    res.json(review);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
