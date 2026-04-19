const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const projectController = require('../controllers/projects/project.controller.js');

// Route to get freelancer projects
router.get('/freelancer/projects', authMiddleware, projectController.getFreelancerProjects);

// Route to update a milestone's status
router.put('/:projectId/milestones/:milestoneId', authMiddleware, projectController.updateMilestoneStatus);

// Client marks a project as complete
router.post('/:projectId/complete', authMiddleware, projectController.markComplete);

module.exports = router;