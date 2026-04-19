// server/routes/admin/notification.routes.js
const express = require('express');
const router = express.Router();
const {
  createNotification,
  createBulkNotifications,
  getNotifications,
  getNotificationById,
  updateNotification,
  deleteNotification,
  getNotificationTemplates,
  sendEmailNotification,
  sendSmsNotification
} = require('../../controllers/admin/notificationController');
const { protect, isAdmin } = require('../../middleware/authMiddleware');

// Apply middleware to all routes
router.use(protect, isAdmin);

// Notification CRUD routes
router.route('/')
  .get(getNotifications)
  .post(createNotification);

router.route('/bulk')
  .post(createBulkNotifications);

router.route('/templates')
  .get(getNotificationTemplates);

router.route('/email')
  .post(sendEmailNotification);

router.route('/sms')
  .post(sendSmsNotification);

router.route('/:id')
  .get(getNotificationById)
  .put(updateNotification)
  .delete(deleteNotification);

module.exports = router;
