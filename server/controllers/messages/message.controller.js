const Message = require('../../models/Message');
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const { getIO } = require('../../utils/socket');

// Create or derive a conversationId based on two user IDs
function makeConversationId(userA, userB) {
  return [userA.toString(), userB.toString()].sort().join('_');
}

// @desc    Get messages in a conversation
// @route   GET /api/messages/:conversationId
// @access  Private
const getMessages = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  if (!conversationId) {
    res.status(400);
    throw new Error('conversationId is required');
  }
  const messages = await Message.find({ conversationId })
    .sort({ createdAt: 1 });
  res.json(messages);
});

// @desc    Send a message
// @route   POST /api/messages/:conversationId
// @access  Private
const sendMessage = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const { receiverId, projectId, content } = req.body;
  const senderId = req.user._id;

  if (!receiverId || !content) {
    res.status(400);
    throw new Error('receiverId and content are required');
  }
  // Optionally override conversationId by recomputing
  const convId = conversationId === 'new'
    ? makeConversationId(senderId, receiverId)
    : conversationId;

  const msg = new Message({
    conversationId: convId,
    senderId,
    receiverId,
    projectId,
    content,
    readStatus: false
  });
  const created = await msg.save();

  // Emit to room
  const io = getIO();
  io.to(convId).emit('new_message', created);
  res.status(201).json(created);
});

// @desc    Mark all unread messages as read
// @route   PUT /api/messages/:conversationId/read
// @access  Private
const markRead = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const userId = req.user._id;
  const result = await Message.updateMany(
    { conversationId, receiverId: userId, readStatus: false },
    { readStatus: true }
  );
  // Notify peers
  const io = getIO();
  io.to(conversationId).emit('messages_read', {
    conversationId,
    count: result.nModified
  });
  res.json({ modified: result.nModified });
});

module.exports = { getMessages, sendMessage, markRead };
