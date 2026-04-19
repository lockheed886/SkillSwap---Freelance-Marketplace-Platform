// server/controllers/freelancers/freelancer.controller.js
const User = require('../../models/User');
const asyncHandler = require('express-async-handler');

//
// Public: Search & filter active freelancers
// GET /api/freelancers
//
const getFreelancers = asyncHandler(async (req, res) => {
  const { skill, name, minRating, maxRate, sortBy = 'createdAt', order = 'desc' } = req.query;
  const query = { role: 'freelancer', isActive: true };

  if (skill) {
    const skillsArray = skill.split(',').map(s => s.trim().toLowerCase());
    query.skills = { $in: skillsArray.map(s => new RegExp(s, 'i')) };
  }
  if (name) query.name = { $regex: name, $options: 'i' };
  if (minRating) {
    const r = parseFloat(minRating);
    if (!isNaN(r)) query.averageRating = { $gte: r };
  }
  if (maxRate) {
    const r = parseFloat(maxRate);
    if (!isNaN(r)) query.hourlyRate = { $lte: r };
  }

  const allowed = ['createdAt','averageRating','name','hourlyRate'];
  const sortOptions = allowed.includes(sortBy)
    ? { [sortBy]: order==='asc'?1:-1 }
    : { createdAt: -1 };

  const freelancers = await User.find(query)
    .select('-password -emailVerificationToken -phoneVerificationCode -passwordResetToken -verificationDocuments')
    .sort(sortOptions);

  res.json({ freelancers });
});

//
// Private: Get my freelancer profile
// GET /api/freelancers/profile
//
const getMyProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  if (!user || user.role !== 'freelancer') {
    return res.status(404).json({ message: 'Freelancer not found' });
  }
  res.json(user);
});

//
// Private: Update my freelancer profile
// PUT /api/freelancers/profile
//
const updateMyProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user || user.role !== 'freelancer') {
    return res.status(404).json({ message: 'Freelancer not found' });
  }

  const { name, bio, skills, hourlyRate, portfolioItems } = req.body;
  if (name) user.name = name;
  if (bio) user.bio = bio;
  if (skills !== undefined) {
    user.skills = Array.isArray(skills)
      ? skills
      : skills.split(',').map(s => s.trim()).filter(s=>s);
  }
  if (hourlyRate !== undefined) user.hourlyRate = hourlyRate;
  if (portfolioItems !== undefined) user.portfolio = portfolioItems;

  // Simple completeness: 20% per filled section
  let completeness = 0;
  if (user.name) completeness += 20;
  if (user.bio) completeness += 20;
  if (user.skills.length) completeness += 20;
  if (user.portfolio.length) completeness += 20;
  if (user.hourlyRate) completeness += 20;
  user.profileCompleteness = completeness;

  const updated = await user.save();
  res.json(updated);
});

module.exports = {
  getFreelancers,
  getMyProfile,
  updateMyProfile,
};
