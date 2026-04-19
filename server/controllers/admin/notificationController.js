// server/controllers/admin/notificationController.js
const Notification = require('../../models/Notification');
const User = require('../../models/User');
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const { getIO } = require('../../utils/socket');

/**
 * @desc    Create a new notification
 * @route   POST /api/admin/notifications
 * @access  Admin
 */
const createNotification = asyncHandler(async (req, res) => {
  const { userId, type, title, message, link, relatedEntity } = req.body;
  
  if (!userId || !type || !title || !message) {
    res.status(400);
    throw new Error('Please provide userId, type, title, and message');
  }
  
  // Validate user exists
  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  
  // Create notification
  const notification = await Notification.create({
    userId,
    type,
    title,
    message,
    link,
    relatedEntity,
    isRead: false
  });
  
  // Emit socket event for real-time notification
  const io = getIO();
  io.to(userId.toString()).emit('notification', {
    _id: notification._id,
    type,
    title,
    message,
    link
  });
  
  res.status(201).json(notification);
});

/**
 * @desc    Create notifications for multiple users
 * @route   POST /api/admin/notifications/bulk
 * @access  Admin
 */
const createBulkNotifications = asyncHandler(async (req, res) => {
  const { userIds, type, title, message, link, relatedEntity } = req.body;
  
  if (!userIds || !Array.isArray(userIds) || userIds.length === 0 || !type || !title || !message) {
    res.status(400);
    throw new Error('Please provide userIds array, type, title, and message');
  }
  
  // Validate users exist
  const users = await User.find({ _id: { $in: userIds } });
  if (users.length !== userIds.length) {
    res.status(400);
    throw new Error('One or more users not found');
  }
  
  // Create notifications
  const notifications = await Notification.insertMany(
    userIds.map(userId => ({
      userId,
      type,
      title,
      message,
      link,
      relatedEntity,
      isRead: false
    }))
  );
  
  // Emit socket events for real-time notifications
  const io = getIO();
  notifications.forEach(notification => {
    io.to(notification.userId.toString()).emit('notification', {
      _id: notification._id,
      type,
      title,
      message,
      link
    });
  });
  
  res.status(201).json(notifications);
});

/**
 * @desc    Get all notifications (with pagination and filters)
 * @route   GET /api/admin/notifications
 * @access  Admin
 */
const getNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, type, userId, isRead } = req.query;
  
  const query = {};
  if (type) query.type = type;
  if (userId) query.userId = userId;
  if (isRead !== undefined) query.isRead = isRead === 'true';
  
  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    sort: { createdAt: -1 },
    populate: { path: 'userId', select: 'name email role' }
  };
  
  const notifications = await Notification.paginate(query, options);
  
  res.json(notifications);
});

/**
 * @desc    Get notification by ID
 * @route   GET /api/admin/notifications/:id
 * @access  Admin
 */
const getNotificationById = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id)
    .populate('userId', 'name email role');
  
  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }
  
  res.json(notification);
});

/**
 * @desc    Update notification
 * @route   PUT /api/admin/notifications/:id
 * @access  Admin
 */
const updateNotification = asyncHandler(async (req, res) => {
  const { title, message, link, isRead } = req.body;
  
  const notification = await Notification.findById(req.params.id);
  
  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }
  
  notification.title = title || notification.title;
  notification.message = message || notification.message;
  notification.link = link || notification.link;
  notification.isRead = isRead !== undefined ? isRead : notification.isRead;
  
  const updatedNotification = await notification.save();
  
  res.json(updatedNotification);
});

/**
 * @desc    Delete notification
 * @route   DELETE /api/admin/notifications/:id
 * @access  Admin
 */
const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  
  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }
  
  await notification.remove();
  
  res.json({ message: 'Notification removed' });
});

/**
 * @desc    Get notification templates
 * @route   GET /api/admin/notifications/templates
 * @access  Admin
 */
const getNotificationTemplates = asyncHandler(async (req, res) => {
  // This would typically come from a database, but for simplicity, we'll hardcode some templates
  const templates = [
    {
      id: 'verification_approved',
      type: 'verification_approved',
      title: 'Verification Approved',
      message: 'Your account has been verified as a {{level}} freelancer.',
      variables: ['level']
    },
    {
      id: 'verification_rejected',
      type: 'verification_rejected',
      title: 'Verification Rejected',
      message: 'Your verification request has been rejected. {{reason}}',
      variables: ['reason']
    },
    {
      id: 'platform_announcement',
      type: 'platform_announcement',
      title: 'Platform Announcement',
      message: '{{message}}',
      variables: ['message']
    }
  ];
  
  res.json(templates);
});

/**
 * @desc    Send email notification (mock)
 * @route   POST /api/admin/notifications/email
 * @access  Admin
 */
const sendEmailNotification = asyncHandler(async (req, res) => {
  const { userId, subject, message } = req.body;
  
  if (!userId || !subject || !message) {
    res.status(400);
    throw new Error('Please provide userId, subject, and message');
  }
  
  // Find user to get email
  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  
  // In a real implementation, this would send an actual email
  // For now, we'll just mock it
  console.log(`MOCK EMAIL to ${user.email}: ${subject} - ${message}`);
  
  // Create a notification record
  const notification = await Notification.create({
    userId,
    type: 'email_notification',
    title: subject,
    message,
    isRead: false
  });
  
  res.status(200).json({
    success: true,
    message: `Email notification sent to ${user.email}`,
    notification
  });
});

/**
 * @desc    Send SMS notification (mock)
 * @route   POST /api/admin/notifications/sms
 * @access  Admin
 */
const sendSmsNotification = asyncHandler(async (req, res) => {
  const { userId, message } = req.body;
  
  if (!userId || !message) {
    res.status(400);
    throw new Error('Please provide userId and message');
  }
  
  // Find user to get phone number
  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  
  if (!user.phoneNumber) {
    res.status(400);
    throw new Error('User does not have a phone number');
  }
  
  // In a real implementation, this would send an actual SMS via Twilio
  // For now, we'll just mock it
  console.log(`MOCK SMS to ${user.phoneNumber}: ${message}`);
  
  // Create a notification record
  const notification = await Notification.create({
    userId,
    type: 'sms_notification',
    title: 'SMS Notification',
    message,
    isRead: false
  });
  
  res.status(200).json({
    success: true,
    message: `SMS notification sent to ${user.phoneNumber}`,
    notification
  });
});

module.exports = {
  createNotification,
  createBulkNotifications,
  getNotifications,
  getNotificationById,
  updateNotification,
  deleteNotification,
  getNotificationTemplates,
  sendEmailNotification,
  sendSmsNotification
};
