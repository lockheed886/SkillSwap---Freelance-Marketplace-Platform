// client/src/services/notificationService.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL + '/notifications';
const ADMIN_API_URL = import.meta.env.VITE_API_BASE_URL + '/admin/notifications';

// Helper to get auth headers
const getAuthHeaders = () => {
  const userStr = localStorage.getItem('skillswap-user');
  const user = userStr ? JSON.parse(userStr) : null;
  return user?.token ? { Authorization: `Bearer ${user.token}` } : {};
};

// User notification services
const getUserNotifications = async (params = {}) => {
  try {
    const config = { 
      headers: getAuthHeaders(),
      params
    };
    const response = await axios.get(API_URL, config);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch notifications');
  }
};

const markNotificationAsRead = async (notificationId) => {
  try {
    const config = { headers: getAuthHeaders() };
    const response = await axios.put(`${API_URL}/${notificationId}/read`, {}, config);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to mark notification as read');
  }
};

const markAllNotificationsAsRead = async () => {
  try {
    const config = { headers: getAuthHeaders() };
    const response = await axios.put(`${API_URL}/read-all`, {}, config);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to mark all notifications as read');
  }
};

const deleteUserNotification = async (notificationId) => {
  try {
    const config = { headers: getAuthHeaders() };
    const response = await axios.delete(`${API_URL}/${notificationId}`, config);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete notification');
  }
};

const getNotificationPreferences = async () => {
  try {
    const config = { headers: getAuthHeaders() };
    const response = await axios.get(`${API_URL}/preferences`, config);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch notification preferences');
  }
};

const updateNotificationPreferences = async (preferences) => {
  try {
    const config = { headers: getAuthHeaders() };
    const response = await axios.put(`${API_URL}/preferences`, preferences, config);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update notification preferences');
  }
};

// Admin notification services
const getAdminNotifications = async (params = {}) => {
  try {
    const config = { 
      headers: getAuthHeaders(),
      params
    };
    const response = await axios.get(ADMIN_API_URL, config);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch notifications');
  }
};

const createNotification = async (notificationData) => {
  try {
    const config = { headers: getAuthHeaders() };
    const response = await axios.post(ADMIN_API_URL, notificationData, config);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create notification');
  }
};

const createBulkNotifications = async (notificationData) => {
  try {
    const config = { headers: getAuthHeaders() };
    const response = await axios.post(`${ADMIN_API_URL}/bulk`, notificationData, config);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create bulk notifications');
  }
};

const getNotificationTemplates = async () => {
  try {
    const config = { headers: getAuthHeaders() };
    const response = await axios.get(`${ADMIN_API_URL}/templates`, config);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch notification templates');
  }
};

const sendEmailNotification = async (emailData) => {
  try {
    const config = { headers: getAuthHeaders() };
    const response = await axios.post(`${ADMIN_API_URL}/email`, emailData, config);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to send email notification');
  }
};

const sendSmsNotification = async (smsData) => {
  try {
    const config = { headers: getAuthHeaders() };
    const response = await axios.post(`${ADMIN_API_URL}/sms`, smsData, config);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to send SMS notification');
  }
};

const notificationService = {
  // User notification services
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteUserNotification,
  getNotificationPreferences,
  updateNotificationPreferences,
  
  // Admin notification services
  getAdminNotifications,
  createNotification,
  createBulkNotifications,
  getNotificationTemplates,
  sendEmailNotification,
  sendSmsNotification
};

export default notificationService;
