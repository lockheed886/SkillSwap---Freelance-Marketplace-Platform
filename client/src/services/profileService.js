// client/src/services/profileService.js
import axios from 'axios';
const API_URL = import.meta.env.VITE_API_BASE_URL + '/freelancers/profile';

const getMyProfile = async () => {
  const token = JSON.parse(localStorage.getItem('skillswap-user'))?.token;
  const { data } = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
};

const updateMyProfile = async (profileData) => {
  const token = JSON.parse(localStorage.getItem('skillswap-user'))?.token;
  const { data } = await axios.put(API_URL, profileData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
};

export default { getMyProfile, updateMyProfile };
