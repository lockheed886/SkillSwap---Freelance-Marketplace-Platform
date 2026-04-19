// server/routes/notifications/notifications.routes.js
const express = require('express');
const router = express.Router();
const {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getNotificationPreferences,
  updateNotificationPreferences
} = require('../../controllers/notifications/notificationController');
const { protect } = require('../../middleware/authMiddleware');

// Apply middleware to all routes
router.use(protect);

// Get user notifications with pagination
router.get('/', getUserNotifications);

// Mark notification as read
router.put('/:id/read', markNotificationAsRead);

// Mark all notifications as read
router.put('/read-all', markAllNotificationsAsRead);

// Delete notification
router.delete('/:id', deleteNotification);

// Get notification preferences
router.get('/preferences', getNotificationPreferences);

// Update notification preferences
router.put('/preferences', updateNotificationPreferences);

module.exports = router;
