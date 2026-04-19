// server/routes/admin/notifications.routes.js
const express = require('express');
const router = express.Router();
const {
  getAdminNotifications,
  createNotification,
  createBulkNotifications
} = require('../../controllers/notifications/notificationController');
const { protect, isAdmin } = require('../../middleware/authMiddleware');

// Apply middleware to all routes
router.use(protect, isAdmin);

// Get all notifications (admin)
router.get('/', getAdminNotifications);

// Create a notification (admin)
router.post('/', createNotification);

// Create bulk notifications (admin)
router.post('/bulk', createBulkNotifications);

// Mock routes for email and SMS notifications
router.post('/email', (req, res) => {
  // This is a mock implementation
  res.json({ message: 'Email notification sent successfully (mock)' });
});

router.post('/sms', (req, res) => {
  // This is a mock implementation
  res.json({ message: 'SMS notification sent successfully (mock)' });
});

// Mock route for notification templates
router.get('/templates', (req, res) => {
  // This is a mock implementation
  const templates = [
    {
      id: 'platform_announcement',
      type: 'platform_announcement',
      title: 'Platform Announcement',
      message: 'Important announcement from the SkillSwap team.'
    },
    {
      id: 'verification_approved',
      type: 'verification_approved',
      title: 'Verification Approved',
      message: 'Your account has been verified as a {{level}} freelancer.'
    },
    {
      id: 'verification_rejected',
      type: 'verification_rejected',
      title: 'Verification Rejected',
      message: 'Your verification request has been rejected.'
    },
    {
      id: 'account_suspended',
      type: 'account_suspended',
      title: 'Account Suspended',
      message: 'Your account has been suspended due to policy violations.'
    }
  ];
  
  res.json(templates);
});

module.exports = router;
