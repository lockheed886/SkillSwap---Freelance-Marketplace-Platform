// server/routes/projects/project.routes.js
const express = require('express');
const {
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
  submitWork, // Import submitWork
  updateMilestoneStatus, // Import updateMilestoneStatus
} = require('../../controllers/projects/project.controller');
const { checkProjectExists } = require('../../controllers/bids/bid.controller');
const bidRoutes = require('../../routes/bids/bids.routes');
const { protect, isClient, isFreelancer } = require('../../middleware/authMiddleware');

const router = express.Router();

// All project routes require authentication
router.use(protect);

// --- 1) Routes for FREELANCERS ---
router.get('/open', isFreelancer, getOpenProjects); // List all open projects
router.get('/freelancer/projects', isFreelancer, getFreelancerProjects); // List projects for the logged-in freelancer

// --- General project access by ID (moved up) ---
// This needs to come before the freelancer-specific public view for '/:id'
// to ensure correct middleware execution for clients/admins.
router
  .route('/:id')
  .get(getProjectById) // Controller has internal auth logic for various roles
  .put(isClient, updateProject)
  .delete(isClient, deleteProject);

// --- 1.1) Get a specific project (public view for freelancer before bidding) ---
// This route is specific to freelancers viewing public project data.
router.get('/:id/public', isFreelancer, getProjectPublic); // Changed path to be more specific

// --- 2) Nested bids routes ---
// The bidRoutes apply their own isFreelancer/isClient middleware per specific route.
router.use(
   '/:projectId/bids',
   checkProjectExists, // Middleware to check if project exists and attach it to req.project
   bidRoutes           // Delegate to bids.routes.js
);

// --- 3) Client's own projects CRUD (root path) ---
router
  .route('/')
  .get(isClient, getMyProjects)
  .post(isClient, createProject);

// --- 4) Stand‐alone "mark complete" for clients ---
router.put('/:id/complete', isClient, markComplete);

// --- 5) Additional routes for bid management and project status ---
router.put('/:id/accept-bid/:bidId', isClient, acceptBid);
router.put('/:id/complete', isFreelancer, markProjectComplete); // Freelancer marks their part complete
router.put('/:id/submit-work', isFreelancer, submitWork); // Freelancer submits work
router.put('/:id/drop', isFreelancer, dropProject);

// Route to update a milestone's status
router.put('/:projectId/milestones/:milestoneId', protect, updateMilestoneStatus);

module.exports = router;
