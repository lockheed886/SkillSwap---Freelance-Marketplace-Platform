const express = require('express');
const { getMessages, sendMessage, markRead } = require('../../controllers/messages/message.controller');
const { protect } = require('../../middleware/authMiddleware');

const router = express.Router();

// All messaging routes require authentication
router.use(protect);

// GET   /api/messages/:conversationId
router.get('/:conversationId', getMessages);

// POST  /api/messages/:conversationId  
// Use `conversationId = "new"` to create a new one
router.post('/:conversationId', sendMessage);

// PUT   /api/messages/:conversationId/read
router.put('/:conversationId/read', markRead);

module.exports = router;
