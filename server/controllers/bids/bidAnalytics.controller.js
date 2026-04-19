// server/controllers/bids/bidAnalytics.controller.js
const asyncHandler = require('express-async-handler');
const Bid = require('../../models/Bid');

// @desc    Get analytics for the logged-in freelancer's bids
// @route   GET /api/bids/analytics
// @access  Private (Freelancer)
exports.getMyBidAnalytics = asyncHandler(async (req, res) => {
  const [result] = await Bid.aggregate([
    { $match: { freelancerId: req.user._id } },       // <<< pass the string directly
    {
      $facet: {
        totalBids: [{ $count: 'count' }],
        averageAmount: [{ $group: { _id: null, avgAmount: { $avg: '$amount' } } }],
        byStatus: [
          { $group: { _id: '$status', count: { $sum: 1 } } },
          { $project: { status: '$_id', count: 1, _id: 0 } }
        ]
      }
    }
  ]);

  res.json({
    totalBids: result.totalBids[0]?.count || 0,
    averageAmount: result.averageAmount[0]?.avgAmount || 0,
    byStatus: result.byStatus
  });
});
