// server/controllers/admin/analyticsController.js
const Project = require('../../models/Project');
const User = require('../../models/User');
const Bid = require('../../models/Bid');
const Review = require('../../models/Review');
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const { Parser } = require('json2csv'); // for CSV export
const PDFDocument = require('pdfkit');    // for PDF export

// @desc    Get project counts by status & total per day in range
// @route   GET /api/admin/analytics/projects
// @access  Admin
exports.getProjectAnalytics = asyncHandler(async (req, res) => {
  const { dateFrom, dateTo } = req.query;
  const match = {};
  if (dateFrom) match.createdAt = { $gte: new Date(dateFrom) };
  if (dateTo)  match.createdAt = match.createdAt || {}; match.createdAt.$lte = new Date(dateTo);

  // Count by status
  const statusCounts = await Project.aggregate([
    { $match: match },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  // Projects per day
  const perDay = await Project.aggregate([
    { $match: match },
    { $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  res.json({ statusCounts, perDay });
});

// @desc    Get freelancer performance (avg rating, total projects)
// @route   GET /api/admin/analytics/freelancers
// @access  Admin
exports.getFreelancerAnalytics = asyncHandler(async (req, res) => {
  const { dateFrom, dateTo } = req.query;
  const match = { role: 'freelancer' };
  // We only need user table; ratings are kept in user.averageRating
  const freelancers = await User.find(match)
    .select('name averageRating projectsPosted')
    .lean();

  const data = freelancers.map(f => ({
    _id: f._id,
    name: f.name,
    averageRating: f.averageRating,
    totalProjects: (f.projectsPosted || []).length
  }));

  res.json({ data });
});

// @desc    Export analytics data as CSV or PDF
// @route   GET /api/admin/analytics/export
// @access  Admin
// @desc    Get user growth analytics
// @route   GET /api/admin/analytics/user-growth
// @access  Admin
exports.getUserGrowthAnalytics = asyncHandler(async (req, res) => {
  const { dateFrom, dateTo, interval = 'day' } = req.query;

  const match = {};
  if (dateFrom) match.createdAt = { $gte: new Date(dateFrom) };
  if (dateTo) {
    match.createdAt = match.createdAt || {};
    match.createdAt.$lte = new Date(dateTo);
  }

  // Format string for grouping by day, week, or month
  let dateFormat = '%Y-%m-%d';
  if (interval === 'week') dateFormat = '%Y-%U'; // Week number
  if (interval === 'month') dateFormat = '%Y-%m';

  // Get user signups over time by role
  const userGrowth = await User.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: dateFormat, date: '$createdAt' } },
          role: '$role'
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.date': 1 } }
  ]);

  // Get total users by role
  const usersByRole = await User.aggregate([
    { $group: { _id: '$role', count: { $sum: 1 } } }
  ]);

  // Format data for frontend
  const formattedData = {
    growth: userGrowth,
    totalByRole: usersByRole
  };

  res.json(formattedData);
});

// @desc    Get popular skills analytics
// @route   GET /api/admin/analytics/popular-skills
// @access  Admin
exports.getPopularSkillsAnalytics = asyncHandler(async (req, res) => {
  // Get most common skills from freelancer profiles
  const freelancerSkills = await User.aggregate([
    { $match: { role: 'freelancer' } },
    { $unwind: '$skills' },
    { $group: { _id: '$skills', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 20 }
  ]);

  // Get most requested skills from projects
  const projectSkills = await Project.aggregate([
    { $unwind: '$skillsRequired' },
    { $group: { _id: '$skillsRequired', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 20 }
  ]);

  // Get average hourly rate by skill
  const skillRates = await User.aggregate([
    { $match: { role: 'freelancer', hourlyRate: { $gt: 0 } } },
    { $unwind: '$skills' },
    {
      $group: {
        _id: '$skills',
        avgRate: { $avg: '$hourlyRate' },
        minRate: { $min: '$hourlyRate' },
        maxRate: { $max: '$hourlyRate' },
        freelancerCount: { $sum: 1 }
      }
    },
    { $sort: { freelancerCount: -1 } },
    { $limit: 20 }
  ]);

  res.json({
    freelancerSkills,
    projectSkills,
    skillRates
  });
});

// @desc    Get transaction analytics
// @route   GET /api/admin/analytics/transactions
// @access  Admin
exports.getTransactionAnalytics = asyncHandler(async (req, res) => {
  const { dateFrom, dateTo } = req.query;

  const match = {};
  if (dateFrom) match.createdAt = { $gte: new Date(dateFrom) };
  if (dateTo) {
    match.createdAt = match.createdAt || {};
    match.createdAt.$lte = new Date(dateTo);
  }

  // Get project value by status
  const projectValueByStatus = await Project.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$status',
        totalValue: { $sum: '$budget' },
        count: { $sum: 1 },
        avgValue: { $avg: '$budget' }
      }
    },
    { $sort: { totalValue: -1 } }
  ]);

  // Get project value by category
  const projectValueByCategory = await Project.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$category',
        totalValue: { $sum: '$budget' },
        count: { $sum: 1 },
        avgValue: { $avg: '$budget' }
      }
    },
    { $sort: { totalValue: -1 } }
  ]);

  // Get average bid amount vs project budget
  const bidVsBudgetAnalysis = await Project.aggregate([
    { $match: { ...match, bids: { $exists: true, $ne: [] } } },
    {
      $lookup: {
        from: 'bids',
        localField: 'bids',
        foreignField: '_id',
        as: 'bidDetails'
      }
    },
    {
      $project: {
        title: 1,
        budget: 1,
        category: 1,
        avgBid: { $avg: '$bidDetails.amount' },
        bidCount: { $size: '$bidDetails' }
      }
    },
    {
      $group: {
        _id: '$category',
        avgBudget: { $avg: '$budget' },
        avgBidAmount: { $avg: '$avgBid' },
        projectCount: { $sum: 1 }
      }
    }
  ]);

  res.json({
    projectValueByStatus,
    projectValueByCategory,
    bidVsBudgetAnalysis
  });
});

// @desc    Get revenue projections
// @route   GET /api/admin/analytics/revenue
// @access  Admin
exports.getRevenueAnalytics = asyncHandler(async (req, res) => {
  // Assuming platform takes 10% fee from each project
  const platformFeePercentage = 0.1;

  // Get completed projects by month
  const completedProjectsByMonth = await Project.aggregate([
    { $match: { status: 'completed' } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        totalValue: { $sum: '$budget' },
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        yearMonth: {
          $concat: [
            { $toString: '$_id.year' },
            '-',
            { $toString: '$_id.month' }
          ]
        },
        totalValue: 1,
        count: 1,
        estimatedRevenue: { $multiply: ['$totalValue', platformFeePercentage] }
      }
    },
    { $sort: { yearMonth: 1 } }
  ]);

  // Get in-progress projects (potential future revenue)
  const inProgressProjects = await Project.aggregate([
    { $match: { status: 'in_progress' } },
    {
      $group: {
        _id: null,
        totalValue: { $sum: '$budget' },
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        totalValue: 1,
        count: 1,
        potentialRevenue: { $multiply: ['$totalValue', platformFeePercentage] }
      }
    }
  ]);

  // Get open projects (potential future revenue)
  const openProjects = await Project.aggregate([
    { $match: { status: 'open' } },
    {
      $group: {
        _id: null,
        totalValue: { $sum: '$budget' },
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        totalValue: 1,
        count: 1,
        potentialRevenue: { $multiply: ['$totalValue', platformFeePercentage] }
      }
    }
  ]);

  res.json({
    completedProjectsByMonth,
    inProgressProjects: inProgressProjects[0] || { count: 0, totalValue: 0, potentialRevenue: 0 },
    openProjects: openProjects[0] || { count: 0, totalValue: 0, potentialRevenue: 0 },
    platformFeePercentage
  });
});

// @desc    Export analytics data as CSV or PDF
// @route   GET /api/admin/analytics/export
// @access  Admin
exports.exportAnalytics = asyncHandler(async (req, res) => {
  const { format, type = 'projects' } = req.query; // csv or pdf, type of data

  let data = [];
  let fields = [];
  let title = '';
  let filename = '';

  // Get data based on type
  switch (type) {
    case 'projects':
      data = await Project.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);
      fields = ['_id', 'count'];
      title = 'Project Status Counts';
      filename = 'project-status';
      break;
    case 'users':
      data = await User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } }
      ]);
      fields = ['_id', 'count'];
      title = 'User Counts by Role';
      filename = 'user-counts';
      break;
    case 'skills':
      data = await User.aggregate([
        { $match: { role: 'freelancer' } },
        { $unwind: '$skills' },
        { $group: { _id: '$skills', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 20 }
      ]);
      fields = ['_id', 'count'];
      title = 'Top 20 Freelancer Skills';
      filename = 'top-skills';
      break;
    default:
      return res.status(400).json({ message: 'Invalid export type' });
  }

  if (format === 'csv') {
    const parser = new Parser({ fields });
    const csv = parser.parse(data);
    res.header('Content-Type', 'text/csv');
    res.attachment(`${filename}.csv`).send(csv);
  } else {
    const doc = new PDFDocument();
    res.header('Content-Type', 'application/pdf');
    doc.pipe(res);
    doc.fontSize(16).text(title, { underline: true });
    data.forEach(row => {
      doc.moveDown().fontSize(12).text(`${row._id}: ${row.count}`);
    });
    doc.end();
  }
});
