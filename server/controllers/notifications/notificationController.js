// server/controllers/notifications/notificationController.js
const Notification = require('../../models/Notification');
const User = require('../../models/User');
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const { getIO } = require('../../utils/socket');

/**
 * @desc    Get user notifications with pagination
 * @route   GET /api/notifications
 * @access  Private
 */
const getUserNotifications = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { page = 1, limit = 10, isRead } = req.query;
  
  const query = { userId };
  
  // Filter by read status if provided
  if (isRead !== undefined) {
    query.isRead = isRead === 'true';
  }
  
  // Calculate pagination
  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    sort: { createdAt: -1 },
    populate: {
      path: 'relatedEntity.entityId',
      select: 'name title'
    }
  };
  
  // Use Mongoose pagination plugin
  const result = await Notification.paginate(query, options);
  
  res.json(result);
});

/**
 * @desc    Mark notification as read
 * @route   PUT /api/notifications/:id/read
 * @access  Private
 */
const markNotificationAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error('Invalid notification ID');
  }
  
  const notification = await Notification.findById(id);
  
  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }
  
  // Check if notification belongs to user
  if (notification.userId.toString() !== userId.toString()) {
    res.status(403);
    throw new Error('Not authorized to access this notification');
  }
  
  notification.isRead = true;
  await notification.save();
  
  res.json(notification);
});

/**
 * @desc    Mark all user notifications as read
 * @route   PUT /api/notifications/read-all
 * @access  Private
 */
const markAllNotificationsAsRead = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  
  const result = await Notification.updateMany(
    { userId, isRead: false },
    { isRead: true }
  );
  
  res.json({ modified: result.nModified });
});

/**
 * @desc    Delete a notification
 * @route   DELETE /api/notifications/:id
 * @access  Private
 */
const deleteNotification = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error('Invalid notification ID');
  }
  
  const notification = await Notification.findById(id);
  
  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }
  
  // Check if notification belongs to user
  if (notification.userId.toString() !== userId.toString()) {
    res.status(403);
    throw new Error('Not authorized to delete this notification');
  }
  
  await notification.remove();
  
  res.json({ message: 'Notification removed' });
});

/**
 * @desc    Get notification preferences
 * @route   GET /api/notifications/preferences
 * @access  Private
 */
const getNotificationPreferences = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  
  const user = await User.findById(userId).select('notificationPreferences');
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  
  res.json(user.notificationPreferences || {});
});

/**
 * @desc    Update notification preferences
 * @route   PUT /api/notifications/preferences
 * @access  Private
 */
const updateNotificationPreferences = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const preferences = req.body;
  
  const user = await User.findById(userId);
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  
  user.notificationPreferences = preferences;
  await user.save();
  
  res.json(user.notificationPreferences);
});

// Admin notification controllers

/**
 * @desc    Get all notifications (admin)
 * @route   GET /api/admin/notifications
 * @access  Admin
 */
const getAdminNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, userId, type } = req.query;
  
  const query = {};
  
  if (userId) {
    query.userId = userId;
  }
  
  if (type) {
    query.type = type;
  }
  
  // Calculate pagination
  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    sort: { createdAt: -1 },
    populate: {
      path: 'userId',
      select: 'name email'
    }
  };
  
  // Use Mongoose pagination plugin
  const result = await Notification.paginate(query, options);
  
  res.json(result);
});

/**
 * @desc    Create a notification (admin)
 * @route   POST /api/admin/notifications
 * @access  Admin
 */
const createNotification = asyncHandler(async (req, res) => {
  const { userId, type, title, message, link } = req.body;
  
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    res.status(400);
    throw new Error('Invalid user ID');
  }
  
  const user = await User.findById(userId);
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  
  const notification = new Notification({
    userId,
    type,
    title,
    message,
    link,
    isRead: false
  });
  
  const created = await notification.save();
  
  // Emit socket event for real-time notification
  const io = getIO();
  io.to(userId.toString()).emit('notification', {
    type,
    title,
    message
  });
  
  res.status(201).json(created);
});

/**
 * @desc    Create bulk notifications (admin)
 * @route   POST /api/admin/notifications/bulk
 * @access  Admin
 */
const createBulkNotifications = asyncHandler(async (req, res) => {
  const { userIds, type, title, message, link } = req.body;
  
  if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
    res.status(400);
    throw new Error('User IDs array is required');
  }
  
  // Validate all user IDs
  const validUserIds = userIds.filter(id => mongoose.Types.ObjectId.isValid(id));
  
  if (validUserIds.length === 0) {
    res.status(400);
    throw new Error('No valid user IDs provided');
  }
  
  // Create notifications in bulk
  const notifications = validUserIds.map(userId => ({
    userId,
    type,
    title,
    message,
    link,
    isRead: false
  }));
  
  const created = await Notification.insertMany(notifications);
  
  // Emit socket events for real-time notifications
  const io = getIO();
  validUserIds.forEach(userId => {
    io.to(userId.toString()).emit('notification', {
      type,
      title,
      message
    });
  });
  
  res.status(201).json(created);
});

module.exports = {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getNotificationPreferences,
  updateNotificationPreferences,
  getAdminNotifications,
  createNotification,
  createBulkNotifications
};
