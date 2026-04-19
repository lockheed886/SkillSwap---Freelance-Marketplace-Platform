// client/src/services/bidService.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Helper to get auth headers (same as in projectService)
const getAuthHeaders = () => {
    const userStr = localStorage.getItem('skillswap-user');
    const user = userStr ? JSON.parse(userStr) : null;
    return user?.token ? { Authorization: `Bearer ${user.token}` } : {};
  };

// Submit a bid
const submitBid = async (projectId, bidData) => {
    try {
        const config = { headers: getAuthHeaders() };
        const response = await axios.post(`${API_BASE_URL}/projects/${projectId}/bids`, bidData, config);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to submit bid');
    }
};

// Get bids for a project
const getBidsForProject = async (projectId, params = {}) => { // params for sort/filter
     try {
        const config = { headers: getAuthHeaders(), params };
        const response = await axios.get(`${API_BASE_URL}/projects/${projectId}/bids`, config);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch bids');
    }
};

// Update bid status (accept/reject) or make counter-offer
const updateBid = async (projectId, bidId, updateData) => {
     try {
        const config = { headers: getAuthHeaders() };
        // updateData could be { status: 'accepted' } or { counterOfferAmount: ..., counterOfferMessage: ... }
        const response = await axios.put(`${API_BASE_URL}/projects/${projectId}/bids/${bidId}`, updateData, config);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to update bid');
    }
};

// Withdraw a bid
const withdrawBid = async (projectId, bidId) => {
     try {
        const config = { headers: getAuthHeaders() };
        const response = await axios.delete(`${API_BASE_URL}/projects/${projectId}/bids/${bidId}`, config);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to withdraw bid');
    }
};

// Respond to a counter-offer
const respondToCounterOffer = async (projectId, bidId, accept) => {
     try {
        const config = { headers: getAuthHeaders() };
        const response = await axios.put(`${API_BASE_URL}/projects/${projectId}/bids/${bidId}/respond-counter`, { accept }, config);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to respond to counter-offer');
    }
};

// — New: Freelancer-level analytics
const getMyBidAnalytics = async () => {
    try {
      const config = { headers: getAuthHeaders() };
      const response = await axios.get(`${API_BASE_URL}/bids/analytics`, config);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch bid analytics');
    }
};

const getProjectBidAnalytics = async (projectId) => {
    try {
      const config = { headers: getAuthHeaders() };
      const response = await axios.get(
        `${API_BASE_URL}/projects/${projectId}/bids/analytics`,
        config
      );
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to fetch analytics');
    }
};

const bidService = {
    submitBid,
    getBidsForProject,
    updateBid,
    withdrawBid,
    respondToCounterOffer,
    getMyBidAnalytics,
    getProjectBidAnalytics
};

export default bidService;