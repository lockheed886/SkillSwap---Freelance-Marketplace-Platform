// client/src/services/chatService.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL + '/messages';

// Pull token from localStorage just like other services
function getAuthHeaders() {
  const userStr = localStorage.getItem('skillswap-user');
  const user = userStr ? JSON.parse(userStr) : null;
  if (user?.token) {
    return { Authorization: `Bearer ${user.token}` };
  }
  return {};
}

/**
 * Fetch all conversations for the current user.
 * Each item might include: 
 *  - _id (conversationId)
 *  - partnerId, partnerName
 *  - lastMessage, updatedAt
 */
export async function getMyConversations() {
  try {
    const config = { headers: getAuthHeaders() };
    const res = await axios.get(`${API_BASE_URL}/conversations`, config);
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || 'Failed to fetch conversations');
  }
}

/**
 * Fetch all messages in a conversation
 * @param {string} conversationId 
 */
export async function getMessages(conversationId) {
  try {
    const config = { headers: getAuthHeaders() };
    const res = await axios.get(`${API_BASE_URL}/${conversationId}`, config);
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || 'Failed to fetch messages');
  }
}

/**
 * Send a new message in a conversation
 * @param {string} conversationId 
 * @param {string} content 
 */
export async function sendMessage(conversationId, content) {
  try {
    const config = { headers: getAuthHeaders() };
    const res = await axios.post(
      `${API_BASE_URL}/${conversationId}`,
      { content },
      config
    );
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || 'Failed to send message');
  }
}

export default {
  getMyConversations,
  getMessages,
  sendMessage,
};
