// server/controllers/bids/bid.controller.js
const Bid = require('../../models/Bid');
const Project = require('../../models/Project');
const User = require('../../models/User');
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const { getIO } = require('../../utils/socket');

// Middleware to check if project exists and attach it
const checkProjectExists = asyncHandler(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.projectId)) {
    res.status(400);
    throw new Error('Invalid Project ID format');
  }
  const project = await Project.findById(req.params.projectId);
  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }
  req.project = project;
  next();
});

// @desc Submit a bid for a project
// @route POST /api/projects/:projectId/bids
// @access Private (Freelancer only)
const submitBid = asyncHandler(async (req, res) => {
  const { amount, message, estimatedDuration } = req.body;
  const { project } = req;
  const freelancerId = req.user._id;

  if (!amount || !message) {
    res.status(400);
    throw new Error('Please provide amount and message for the bid');
  }
  if (project.clientId.equals(freelancerId)) {
    res.status(400);
    throw new Error('You cannot bid on your own project');
  }
  if (project.status !== 'open') {
    res.status(400);
    throw new Error(`Project is not open for bidding (status: ${project.status})`);
  }
  const existing = await Bid.findOne({ projectId: project._id, freelancerId });
  if (existing && existing.status !== 'withdrawn') {
    res.status(400);
    throw new Error('You have already placed an active bid on this project. Withdraw your previous bid to place a new one.');
  }

  const bid = new Bid({
    projectId: project._id,
    freelancerId,
    amount: parseFloat(amount),
    message,
    estimatedDuration,
    status: 'pending',
  });
  const created = await bid.save();

  // Update project and user
  project.bids.push(created._id);
  await project.save();
  await User.findByIdAndUpdate(freelancerId, { $push: { bidsPlaced: created._id } });

  // REAL-TIME EMIT
  const io = getIO();
  io.to(project._id.toString()).emit('new_bid', created);

  res.status(201).json(created);
});

// @desc Get all bids for a specific project
// @route GET /api/projects/:projectId/bids
// @access Private (Client only)
const getBidsForProject = asyncHandler(async (req, res) => {
  const { project } = req;
  if (!project.clientId.equals(req.user._id)) {
    res.status(403);
    throw new Error('Not authorized to view bids for this project');
  }

  const { sortBy = 'createdAt', order = 'desc' } = req.query;
  const sortOptions = {};
  const allowed = ['createdAt','amount','status'];
  sortOptions[ allowed.includes(sortBy) ? sortBy : 'createdAt' ] = order === 'asc' ? 1 : -1;

  const bids = await Bid.find({ projectId: project._id })
    .populate('freelancerId', 'name email averageRating')
    .sort(sortOptions);

  res.json(bids);
});

// @desc Update bid status or make counter-offer
// @route PUT /api/projects/:projectId/bids/:bidId
// @access Private (Client only)
const updateBid = asyncHandler(async (req, res) => {
  const { status, counterOfferAmount, counterOfferMessage } = req.body;
  const project = req.project;

  if (!project.clientId.equals(req.user._id)) {
    res.status(403);
    throw new Error('Not authorized to update bids for this project');
  }
  const { bidId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(bidId)) {
    res.status(400);
    throw new Error('Invalid Bid ID');
  }

  const bid = await Bid.findById(bidId);
  if (!bid || !bid.projectId.equals(project._id)) {
    res.status(404);
    throw new Error('Bid not found for this project');
  }

  let eventType;
  // Handle counter-offer
  if (counterOfferAmount != null && counterOfferMessage != null) {
    if (!['pending','counter_rejected'].includes(bid.status)) {
      res.status(400);
      throw new Error(`Cannot counter a bid in status: ${bid.status}`);
    }
    bid.counterOffer = {
      amount: parseFloat(counterOfferAmount),
      message: counterOfferMessage,
      offeredBy: req.user._id,
      offeredAt: new Date()
    };
    bid.status = 'counter_offered';
    eventType = 'counter_offer';
  }
  // Handle accept/reject
  else if (status) {
    if (!['accepted','rejected'].includes(status)) {
      res.status(400);
      throw new Error('Invalid status update');
    }
    if (!['pending','counter_accepted'].includes(bid.status)) {
      res.status(400);
      throw new Error(`Cannot ${status} a bid in status: ${bid.status}`);
    }

    if (status === 'accepted') {
      if (!['open','pending_selection'].includes(project.status)) {
        res.status(400);
        throw new Error(`Project not open for acceptance (status: ${project.status})`);
      }
      project.status = 'in_progress';
      project.freelancerId = bid.freelancerId;
      await project.save();

      // Reject other pending bids
      await Bid.updateMany(
        { projectId: project._id, _id: { $ne: bid._id }, status: 'pending' },
        { status: 'rejected' }
      );

      bid.status = 'accepted';
      eventType = 'bid_accepted';
    } else {
      bid.status = 'rejected';
      eventType = 'bid_rejected';
    }
  } else {
    res.status(400);
    throw new Error('No valid action provided');
  }

  const updated = await bid.save();
  const io = getIO();
  // emit to both client room and freelancer room
  io.to(project._id.toString()).emit(eventType, updated);
  io.to(bid.freelancerId.toString()).emit(eventType, updated);

  res.json(updated);
});

// @desc Withdraw a bid
// @route DELETE /api/projects/:projectId/bids/:bidId
// @access Private (Freelancer only)
const withdrawBid = asyncHandler(async (req, res) => {
  const { project } = req;
  const { bidId } = req.params;
  const freelancerId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(bidId)) {
    res.status(400);
    throw new Error('Invalid Bid ID');
  }
  const bid = await Bid.findById(bidId);
  if (!bid || !bid.projectId.equals(project._id)) {
    res.status(404);
    throw new Error('Bid not found for this project');
  }
  if (!bid.freelancerId.equals(freelancerId)) {
    res.status(403);
    throw new Error('Not authorized to withdraw this bid');
  }
  if (!['pending','counter_offered'].includes(bid.status)) {
    res.status(400);
    throw new Error(`Cannot withdraw bid in status: ${bid.status}`);
  }

  bid.status = 'withdrawn';
  await bid.save();

  const io = getIO();
  io.to(project._id.toString()).emit('bid_withdrawn', { _id: bid._id });

  res.json({ message: 'Bid withdrawn successfully' });
});

// @desc Freelancer responds to counter-offer
// @route PUT /api/projects/:projectId/bids/:bidId/respond-counter
// @access Private (Freelancer only)
const respondToCounterOffer = asyncHandler(async (req, res) => {
  const { accept } = req.body;
  const { project } = req;
  const { bidId } = req.params;
  const freelancerId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(bidId)) {
    res.status(400);
    throw new Error('Invalid Bid ID');
  }
  const bid = await Bid.findById(bidId);
  if (!bid || !bid.projectId.equals(project._id)) {
    res.status(404);
    throw new Error('Bid not found for this project');
  }
  if (!bid.freelancerId.equals(freelancerId)) {
    res.status(403);
    throw new Error('Not authorized to respond to this counter-offer');
  }
  if (bid.status !== 'counter_offered' || !bid.counterOffer) {
    res.status(400);
    throw new Error('No active counter-offer to respond to');
  }
  if (typeof accept !== 'boolean') {
    res.status(400);
    throw new Error('Invalid response format');
  }

  bid.status = accept ? 'counter_accepted' : 'counter_rejected';
  const updated = await bid.save();

  const io = getIO();
  io.to(project._id.toString()).emit('counter_response', updated);
  io.to(bid.clientId.toString()).emit('counter_response', updated);

  res.json(updated);
});
// @desc    Get bid analytics for a project (avg price, count, breakdown by status)
// @route   GET /api/projects/:projectId/bids/analytics
// @access  Private (Client only)
const getProjectBidAnalytics = asyncHandler(async (req, res) => {
  const projectId = req.params.projectId;
  // make sure the client owns it
  if (!req.project.clientId.equals(req.user._id)) {
    res.status(403);
    throw new Error('Not authorized');
  }

  // aggregate bids on that project
  const stats = await Bid.aggregate([
    { $match: { projectId: req.project._id } },
    { $group: {
        _id: '$projectId',
        totalBids: { $sum: 1 },
        avgAmount: { $avg: '$amount' },
        minAmount: { $min: '$amount' },
        maxAmount: { $max: '$amount' },
        byStatus: { $push: '$status' }
    }},
  ]);

  if (!stats.length) {
    return res.json({
      totalBids: 0,
      avgAmount: 0,
      minAmount: 0,
      maxAmount: 0,
      statusCounts: {}
    });
  }

  const { totalBids, avgAmount, minAmount, maxAmount, byStatus } = stats[0];
  // count each status
  const statusCounts = byStatus.reduce((acc, s) => {
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  res.json({ totalBids, avgAmount, minAmount, maxAmount, statusCounts });
});
const getFreelancerBidAnalytics = asyncHandler(async (req, res) => {
  const freelancerId = req.user._id;

  const stats = await Bid.aggregate([
    { $match: { freelancerId: mongoose.Types.ObjectId(freelancerId) } },
    {
      $group: {
        _id: '$freelancerId',
        averageBid: { $avg: '$amount' },
        totalBids:  { $sum: 1 },
        statuses:   { $push: '$status' }
      }
    }
  ]);

  if (!stats[0]) {
    return res.json({
      freelancerId,
      averageBid: 0,
      totalBids:  0,
      statusCounts: {}
    });
  }

  const { averageBid, totalBids, statuses } = stats[0];
  const statusCounts = statuses.reduce((acc, s) => {
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  res.json({ freelancerId, averageBid, totalBids, statusCounts });
});
module.exports = {
  checkProjectExists,
  submitBid,
  getBidsForProject,
  updateBid,
  withdrawBid,
  respondToCounterOffer,
  getProjectBidAnalytics,
  getFreelancerBidAnalytics,
};
