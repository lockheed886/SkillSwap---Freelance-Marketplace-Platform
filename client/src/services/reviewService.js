// client/src/services/reviewService.js
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL; // "http://localhost:5000/api"
const API_URL  = `${API_BASE}/reviews`;            // → http://localhost:5000/api/reviews

// attach the JWT if present
const getAuthHeaders = () => {
  const userStr = localStorage.getItem('skillswap-user');
  if (!userStr) return {};
  const { token } = JSON.parse(userStr);
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const createReview = async (reviewData) => {
  // reviewData must include { projectId, freelancerId, rating, comment }
  const config = { headers: getAuthHeaders() };
  const { data } = await axios.post(API_URL, reviewData, config);
  return data;
};

export const getFreelancerReviews = async (freelancerId, filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const { data } = await axios.get(
    `${API_URL}/freelancer/${freelancerId}?${params}`,
    { headers: getAuthHeaders() } // optional if you want auth
  );
  // always return an array
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.reviews)) return data.reviews;
  return [];
};

export const respondToReview = async (reviewId, responseText) => {
  const config = { headers: getAuthHeaders() };
  const { data } = await axios.put(
    `${API_URL}/${reviewId}/response`,
    { response: responseText },
    config
  );
  return data;
};
export default { createReview, getFreelancerReviews, respondToReview };
