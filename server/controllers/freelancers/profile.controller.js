// server/controllers/freelancers/profile.controller.js
const User = require('../../models/User');
const asyncHandler = require('express-async-handler');

// Utility to calculate profile completeness (0–100%)
function calcCompleteness(user) {
  const fields = [
    user.name,
    user.bio,
    user.skills?.length,
    user.portfolio?.length,
    user.hourlyRate
  ];
  const filled = fields.filter(f => f && (!Array.isArray(f) || f.length > 0)).length;
  return Math.round((filled / fields.length) * 100);
}

// @desc    Get current freelancer profile
// @route   GET /api/freelancers/profile
// @access  Private (Freelancer)
exports.getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .select('-password')
    .lean();
  if (!user) return res.status(404).json({ message: 'User not found' });

  user.profileCompleteness = calcCompleteness(user);
  res.json(user);
});

// @desc    Update current freelancer profile
// @route   PUT /api/freelancers/profile
// @access  Private (Freelancer)
exports.updateProfile = asyncHandler(async (req, res) => {
  const {
    bio,
    skills,
    hourlyRate,
    portfolio,      // Expect array of { title, description, url, imageUrl, category }
    verificationStatus
  } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  // Update allowed fields
  if (bio !== undefined) user.bio = bio.trim();
  if (hourlyRate !== undefined) user.hourlyRate = Number(hourlyRate);
  if (Array.isArray(skills)) user.skills = skills.map(s => s.trim().toLowerCase()).filter(s => s);
  if (Array.isArray(portfolio)) user.portfolio = portfolio;
  if (verificationStatus) user.verificationStatus = verificationStatus; // e.g., 'pending'

  // Recalculate completeness
  user.profileCompleteness = calcCompleteness(user);

  const updated = await user.save();
  const out = updated.toObject();
  delete out.password;
  res.json(out);
});
