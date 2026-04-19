// client/src/services/analyticsService.js
import axios from 'axios';
const API = import.meta.env.VITE_API_BASE_URL + '/admin/analytics';

const getProjectAnalytics = async (params) => {
  const res = await axios.get(`${API}/projects`, { params, headers: authHeaders() });
  return res.data;
};

const getFreelancerAnalytics = async (params) => {
  const res = await axios.get(`${API}/freelancers`, { params, headers: authHeaders() });
  return res.data;
};

const getUserGrowthAnalytics = async (params) => {
  const res = await axios.get(`${API}/user-growth`, { params, headers: authHeaders() });
  return res.data;
};

const getPopularSkillsAnalytics = async (params) => {
  const res = await axios.get(`${API}/popular-skills`, { params, headers: authHeaders() });
  return res.data;
};

const getTransactionAnalytics = async (params) => {
  const res = await axios.get(`${API}/transactions`, { params, headers: authHeaders() });
  return res.data;
};

const getRevenueAnalytics = async (params) => {
  const res = await axios.get(`${API}/revenue`, { params, headers: authHeaders() });
  return res.data;
};

const exportAnalytics = async (format, type = 'projects') => {
  const res = await axios.get(`${API}/export`, {
    params: { format, type },
    headers: authHeaders(),
    responseType: 'blob'
  });
  return res.data;
};

// helper for auth header
function authHeaders() {
  const user = JSON.parse(localStorage.getItem('skillswap-user') || '{}');
  return user.token ? { Authorization: `Bearer ${user.token}` } : {};
}

export default {
  getProjectAnalytics,
  getFreelancerAnalytics,
  getUserGrowthAnalytics,
  getPopularSkillsAnalytics,
  getTransactionAnalytics,
  getRevenueAnalytics,
  exportAnalytics
};
