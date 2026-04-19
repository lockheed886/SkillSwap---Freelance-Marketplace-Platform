// server/routes/notifications/notification.routes.js
const express = require('express');
const router = express.Router();
const {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteUserNotification,
  getNotificationPreferences,
  updateNotificationPreferences
} = require('../../controllers/notifications/userNotificationController');
const { protect } = require('../../middleware/authMiddleware');

// Apply middleware to all routes
router.use(protect);

// Get user's notifications
router.get('/', getUserNotifications);

// Mark all notifications as read
router.put('/read-all', markAllNotificationsAsRead);

// Notification preferences
router.route('/preferences')
  .get(getNotificationPreferences)
  .put(updateNotificationPreferences);

// Individual notification operations
router.route('/:id')
  .delete(deleteUserNotification);

router.put('/:id/read', markNotificationAsRead);

module.exports = router;
