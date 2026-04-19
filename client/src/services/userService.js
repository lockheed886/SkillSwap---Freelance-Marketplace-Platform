// client/src/services/userService.js
import api from './api';

export const getUserById = async (userId) => {
  const res = await api.get(`/users/${userId}`);
  return res.data;
};

export default {
  getUserById
};
