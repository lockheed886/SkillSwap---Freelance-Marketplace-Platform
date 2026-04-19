// server/controllers/projects/project.controller.js
const Project = require('../../models/Project');
const User = require('../../models/User');
const asyncHandler = require('express-async-handler');
const Bid = require('../../models/Bid');
const mongoose = require('mongoose'); // Ensure mongoose is imported

// @desc    Create a new project
// @route   POST /api/projects
const createProject = asyncHandler(async (req, res) => {
  const { title, description, requirements, category, budget, deadline, skillsRequired } = req.body;
  const clientId = req.user._id;

  // Determine budget for DB storage and for milestone calculation
  const parsedBudget = parseFloat(budget);
  const dbStorageBudget = !isNaN(parsedBudget) ? parsedBudget : undefined;
  const budgetForCalculation = !isNaN(parsedBudget) && parsedBudget > 0 ? parsedBudget : 0;

  const project = new Project({
    title,
    description,
    requirements,
    category,
    budget: dbStorageBudget, // Store original valid budget or undefined
    deadline,
    skillsRequired,
    clientId,
    status: 'open',
    milestones: [] // Initialize milestones array
  });

  // Auto-generate 4 milestones if a deadline is present and valid
  if (deadline) {
    const projectStartDate = new Date(); // Milestones due dates relative to creation time
    const projectDeadline = new Date(deadline);
    const numberOfMilestones = 4;
    const projectDuration = projectDeadline.getTime() - projectStartDate.getTime();

    // Frontend validation should ensure deadline is in the future, making projectDuration positive.
    if (projectDuration > 0) {
      const milestoneAmount = budgetForCalculation > 0 
        ? parseFloat((budgetForCalculation / numberOfMilestones).toFixed(2)) 
        : 0;

      for (let i = 1; i <= numberOfMilestones; i++) {
        const milestoneDueDate = new Date(projectStartDate.getTime() + (projectDuration / numberOfMilestones) * i);
        let milestoneDescription = `Milestone ${i}/${numberOfMilestones}`;
        
        if (milestoneAmount === 0 && budgetForCalculation === 0) {
          // Add note if budget wasn't provided or was zero, leading to zero amount milestones
          milestoneDescription += ' (Budget not specified or zero for amount calculation)';
        }

        project.milestones.push({
          description: milestoneDescription,
          dueDate: milestoneDueDate,
          amount: milestoneAmount,
          status: 'pending',
          isPaid: false
        });
      }
    } else {
      // This case implies an invalid deadline (e.g., not in the future) that bypassed frontend validation.
      // To ensure projects always have milestones as per the strong requirement:
      console.warn(`Project "${title}" has a non-positive duration. Deadline: ${deadline}. Creating generic milestones.`);
      for (let i = 1; i <= 4; i++) {
        project.milestones.push({
          description: `Generic Milestone ${i}/4 (Review project deadline details)`,
          dueDate: null, 
          amount: 0,
          status: 'pending',
          isPaid: false
        });
      }
    }
  } else {
    // This case implies deadline was not provided, which should be caught by model validation or frontend.
    // To ensure projects always have milestones:
    console.warn(`Project "${title}" created without a deadline. Creating generic milestones.`);
    for (let i = 1; i <= 4; i++) {
      project.milestones.push({
        description: `Generic Milestone ${i}/4 (Project deadline not set)`,
        dueDate: null,
        amount: 0,
        status: 'pending',
        isPaid: false
      });
    }
  }

  const savedProject = await project.save();
  await User.findByIdAndUpdate(clientId, { $push: { projectsPosted: savedProject._id } });

  res.status(201).json(savedProject);
});

// @desc    Get projects for the logged-in client
// @route   GET /api/projects
const getMyProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({ clientId: req.user._id })
    .sort({ createdAt: -1 })
    .select('title status deadline budget createdAt');
  res.json(projects);
});

// @desc    Get a single project by ID (for client, assigned freelancer, or admin)
// @route   GET /api/projects/:id
const getProjectById = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Invalid Project ID format');
  }

  const project = await Project.findById(req.params.id)
    .populate('clientId', 'name email')
    .populate('freelancerId', 'name email')
    .populate('milestones');

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  // Authorization
  const isClientOwner = project.clientId && project.clientId._id.equals(req.user._id);
  const isAssignedFreelancer = project.freelancerId && project.freelancerId._id.equals(req.user._id);
  const isAdmin = req.user.role === 'admin';

  if (!isClientOwner && !isAssignedFreelancer && !isAdmin) {
    res.status(403);
    throw new Error('Not authorized to access this project');
  }

  res.json(project);
});

const getProjectPublic = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate('clientId', 'name email') // Populate client details
    .populate('freelancerId', 'name email') // Populate freelancer details
    .populate('milestones'); // Populate milestones

  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }
  res.json(project);
});

// @desc    Update a project
// @route   PUT /api/projects/:id
const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findOne({ _id: req.params.id, clientId: req.user._id });
  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }
  // Only allow updates when project is still open
  if (project.status !== 'open') {
    return res.status(400).json({ message: `Cannot modify project in '${project.status}' status` });
  }

  Object.assign(project, req.body);
  const updated = await project.save();
  res.json(updated);
});
const markComplete = async (req, res) => {
  const { id } = req.params;
  const project = await Project.findById(id);
  if (!project) return res.status(404).json({ message: 'Not found' });
  if (!project.clientId.equals(req.user._id)) {
    return res.status(403).json({ message: 'Unauthorized' });
  }
  project.status = 'completed';
  await project.save();
  res.json(project);
};

// @desc    Delete a project
// @route   DELETE /api/projects/:id
const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findOne({ _id: req.params.id, clientId: req.user._id });
  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }
  // Only allow delete when no bids have been placed
  if (project.bids.length > 0) {
    return res.status(400).json({ message: 'Cannot delete a project that has bids' });
  }
  await project.deleteOne();
  await User.findByIdAndUpdate(req.user._id, { $pull: { projectsPosted: project._id } });
  res.json({ message: 'Project deleted successfully' });
});
const getOpenProjects = asyncHandler(async (req, res) => {
  // Only freelancers should hit this, but controller itself doesn’t check role
  const projects = await Project.find({ status: 'open' }).sort({ createdAt: -1 });
  res.json(projects);
});

const getFreelancerProjects = asyncHandler(async (req, res) => {
  const { status, category } = req.query;
  const match = { freelancerId: req.user._id }; // Look for projects assigned to this freelancer

  if (status) match.status = status;
  if (category) match.category = category.toLowerCase(); // Ensure category is lowercase for matching

  const projects = await Project.find(match)
    .sort({ createdAt: -1 })
    .populate('milestones') // Populate milestones
    .select('title status category deadline budget createdAt milestones'); // Select relevant fields, including milestones

  res.json(projects);
});

const acceptBid = asyncHandler(async (req, res) => {
  const { id, bidId } = req.params;
  const project = await Project.findById(id);

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  if (!project.clientId.equals(req.user._id)) {
    res.status(403);
    throw new Error('Not authorized to accept bids for this project');
  }

  const bid = await Bid.findById(bidId);
  if (!bid || !bid.projectId.equals(project._id)) {
    res.status(404);
    throw new Error('Bid not found for this project');
  }

  project.status = 'in_progress';
  project.freelancerId = bid.freelancerId;
  await project.save();

  bid.status = 'accepted';
  await bid.save();

  await Bid.updateMany(
    { projectId: project._id, _id: { $ne: bid._id } },
    { status: 'rejected' }
  );

  res.json({ message: 'Bid accepted and project moved to in progress' });
});

const markProjectComplete = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const project = await Project.findById(id);

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  if (!project.freelancerId.equals(req.user._id)) {
    res.status(403);
    throw new Error('Not authorized to complete this project');
  }

  project.status = 'completed';
  await project.save();

  res.json({ message: 'Project marked as completed' });
});

const dropProject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const project = await Project.findById(id);

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  if (!project.freelancerId.equals(req.user._id)) {
    res.status(403);
    throw new Error('Not authorized to drop this project');
  }

  project.status = 'open';
  project.freelancerId = null;
  await project.save();

  res.json({ message: 'Project dropped and moved back to open' });
});

const submitWork = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  // Check if the logged-in user is the assigned freelancer
  if (!project.freelancerId || !project.freelancerId.equals(req.user._id)) {
    res.status(403);
    throw new Error('Not authorized to submit work for this project');
  }

  // Check if the project is in a state that allows work submission
  if (project.status !== 'in_progress') {
    res.status(400);
    throw new Error(`Project must be in 'in_progress' state to submit work. Current status: ${project.status}`);
  }

  project.status = 'work_submitted';
  // Optionally, add a submission date or details from req.body
  // project.workSubmission = { date: new Date(), notes: req.body.notes };
  await project.save();

  // TODO: Emit a socket event to notify the client
  // const io = getIO();
  // io.to(project.clientId.toString()).emit('work_submitted', project);

  res.json({ message: 'Work submitted successfully', project });
});

const updateMilestoneStatus = async (req, res) => {
  const { projectId, milestoneId } = req.params;
  const { status } = req.body; // Expecting { status: 'new_status' }

  // Validate status
  if (!['pending', 'in_progress', 'completed'].includes(status)) {
    return res.status(400).json({ message: 'Invalid milestone status.' });
  }

  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    // Ensure the user updating is either the client or the assigned freelancer
    const isClient = project.clientId.toString() === req.user.id;
    const isAssignedFreelancer = project.freelancerId && project.freelancerId.toString() === req.user.id;

    if (!isClient && !isAssignedFreelancer) {
      return res.status(403).json({ message: 'User not authorized to update this milestone.' });
    }

    const milestone = project.milestones.id(milestoneId);
    if (!milestone) {
      return res.status(404).json({ message: 'Milestone not found.' });
    }

    // Prevent status changes if milestone is paid
    if (milestone.isPaid) {
      return res.status(400).json({ message: 'Cannot change status of a paid milestone.' });
    }

    milestone.status = status;
    await project.save();

    // After updating a milestone, recalculate overall project status if needed
    const allMilestonesCompleted = project.milestones.every(m => m.status === 'completed');
    if (allMilestonesCompleted && project.status !== 'completed') {
      project.status = 'completed';
      await project.save();
    }

    res.status(200).json({ message: 'Milestone status updated successfully.', project });

  } catch (error) {
    console.error('Error updating milestone status:', error);
    res.status(500).json({ message: 'Server error while updating milestone status.', error: error.message });
  }
};

module.exports = {
  createProject,
  getMyProjects,
  getProjectPublic,
  getProjectById,
  updateProject,
  deleteProject,
  markComplete,
  getOpenProjects,
  getFreelancerProjects,
  acceptBid,
  markProjectComplete,
  dropProject,
  submitWork,
  updateMilestoneStatus, // Export updateMilestoneStatus
};
