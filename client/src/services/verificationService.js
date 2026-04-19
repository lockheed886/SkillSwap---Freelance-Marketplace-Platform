// client/src/services/verificationService.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL + '/admin/verification';

// Helper to get auth headers
const getAuthHeaders = () => {
  const userStr = localStorage.getItem('skillswap-user');
  const user = userStr ? JSON.parse(userStr) : null;
  return user?.token ? { Authorization: `Bearer ${user.token}` } : {};
};

/**
 * Get all freelancers with pending verification
 */
const getPendingVerifications = async () => {
  try {
    const config = { headers: getAuthHeaders() };
    const response = await axios.get(`${API_URL}/pending`, config);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch pending verifications');
  }
};

/**
 * Get all freelancers by verification status
 * @param {string} status - Verification status (pending, verified, rejected, needs_revision, all)
 */
const getFreelancersByVerificationStatus = async (status = 'all') => {
  try {
    const config = { 
      headers: getAuthHeaders(),
      params: { status }
    };
    const response = await axios.get(API_URL, config);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch freelancers');
  }
};

/**
 * Get freelancer details with verification documents
 * @param {string} freelancerId - Freelancer ID
 */
const getFreelancerVerificationDetails = async (freelancerId) => {
  try {
    const config = { headers: getAuthHeaders() };
    const response = await axios.get(`${API_URL}/${freelancerId}`, config);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch freelancer details');
  }
};

/**
 * Update freelancer verification status
 * @param {string} freelancerId - Freelancer ID
 * @param {object} updateData - Update data (verificationStatus, verificationLevel, adminNotes, documentIds, documentStatus)
 */
const updateVerificationStatus = async (freelancerId, updateData) => {
  try {
    const config = { headers: getAuthHeaders() };
    const response = await axios.put(`${API_URL}/${freelancerId}`, updateData, config);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update verification status');
  }
};

const verificationService = {
  getPendingVerifications,
  getFreelancersByVerificationStatus,
  getFreelancerVerificationDetails,
  updateVerificationStatus
};

export default verificationService;
