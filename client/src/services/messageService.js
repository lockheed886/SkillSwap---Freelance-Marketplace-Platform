import axios from 'axios';
const API = import.meta.env.VITE_API_BASE_URL + '/messages';

// Helper to get Auth headers
function getAuthHeaders() {
  const usr = localStorage.getItem('skillswap-user');
  if (!usr) return {};
  const { token } = JSON.parse(usr);
  return { Authorization: `Bearer ${token}` };
}

export async function getMessages(conversationId) {
  const res = await axios.get(`${API}/${conversationId}`, { headers: getAuthHeaders() });
  return res.data;
}

export async function sendMessage(conversationId, { receiverId, projectId, content }) {
  const res = await axios.post(`${API}/${conversationId}`, { receiverId, projectId, content }, { headers: getAuthHeaders() });
  return res.data;
}

export async function markRead(conversationId) {
  const res = await axios.put(`${API}/${conversationId}/read`, {}, { headers: getAuthHeaders() });
  return res.data;
}

const messageService = { getMessages, sendMessage, markRead };
export default messageService;
