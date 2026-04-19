// server/controllers/notifications/userNotificationController.js
const Notification = require('../../models/Notification');
const User = require('../../models/User');
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');

/**
 * @desc    Get user's notifications
 * @route   GET /api/notifications
 * @access  Private
 */
const getUserNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, isRead } = req.query;
  
  const query = { userId: req.user._id };
  if (isRead !== undefined) query.isRead = isRead === 'true';
  
  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    sort: { createdAt: -1 }
  };
  
  const notifications = await Notification.paginate(query, options);
  
  res.json(notifications);
});

/**
 * @desc    Mark notification as read
 * @route   PUT /api/notifications/:id/read
 * @access  Private
 */
const markNotificationAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    userId: req.user._id
  });
  
  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }
  
  notification.isRead = true;
  await notification.save();
  
  res.json(notification);
});

/**
 * @desc    Mark all notifications as read
 * @route   PUT /api/notifications/read-all
 * @access  Private
 */
const markAllNotificationsAsRead = asyncHandler(async (req, res) => {
  const result = await Notification.updateMany(
    { userId: req.user._id, isRead: false },
    { isRead: true }
  );
  
  res.json({
    success: true,
    message: `Marked ${result.nModified} notifications as read`
  });
});

/**
 * @desc    Delete notification
 * @route   DELETE /api/notifications/:id
 * @access  Private
 */
const deleteUserNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    userId: req.user._id
  });
  
  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }
  
  await notification.remove();
  
  res.json({ message: 'Notification removed' });
});

/**
 * @desc    Get user notification preferences
 * @route   GET /api/notifications/preferences
 * @access  Private
 */
const getNotificationPreferences = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .select('notificationPreferences');
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  
  // If user doesn't have notification preferences yet, create default ones
  if (!user.notificationPreferences) {
    user.notificationPreferences = {
      email: {
        projectUpdates: true,
        bidUpdates: true,
        messages: true,
        platformAnnouncements: true
      },
      inApp: {
        projectUpdates: true,
        bidUpdates: true,
        messages: true,
        platformAnnouncements: true
      },
      sms: {
        projectUpdates: false,
        bidUpdates: false,
        messages: false,
        platformAnnouncements: false
      }
    };
    
    await user.save();
  }
  
  res.json(user.notificationPreferences);
});

/**
 * @desc    Update user notification preferences
 * @route   PUT /api/notifications/preferences
 * @access  Private
 */
const updateNotificationPreferences = asyncHandler(async (req, res) => {
  const { email, inApp, sms } = req.body;
  
  const user = await User.findById(req.user._id);
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  
  // Initialize notification preferences if they don't exist
  if (!user.notificationPreferences) {
    user.notificationPreferences = {};
  }
  
  // Update preferences
  if (email) user.notificationPreferences.email = { ...user.notificationPreferences.email, ...email };
  if (inApp) user.notificationPreferences.inApp = { ...user.notificationPreferences.inApp, ...inApp };
  if (sms) user.notificationPreferences.sms = { ...user.notificationPreferences.sms, ...sms };
  
  await user.save();
  
  res.json(user.notificationPreferences);
});

module.exports = {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteUserNotification,
  getNotificationPreferences,
  updateNotificationPreferences
};
