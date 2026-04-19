// client/src/services/authService.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL + '/auth'; // Get base URL from env

// Register user
const signup = async (userData) => {
    try {
        const response = await axios.post(`${API_URL}/signup`, userData);
        // On successful signup, backend sends back user info (without password)
        // We don't automatically log them in here, they should proceed to login
        // or verify email first depending on the flow
        return response.data;
    } catch (error) {
        // Axios wraps errors, access backend message via error.response.data.message
        throw new Error(error.response?.data?.message || 'Signup failed');
    }
};

// Login user
const login = async (credentials) => {
    try {
        const response = await axios.post(`${API_URL}/login`, credentials);
        if (response.data && response.data.token) {
            // Store token and user info in local storage upon successful login
            localStorage.setItem('skillswap-user', JSON.stringify(response.data));
        }
        return response.data; // Contains user info and token
    } catch (error) {
         throw new Error(error.response?.data?.message || 'Login failed');
    }
};

// Logout user
const logout = () => {
    localStorage.removeItem('skillswap-user');
    // Potentially clear axios auth header if set globally
};

// Get current user from local storage
const getCurrentUser = () => {
    try {
        const userStr = localStorage.getItem('skillswap-user');
        return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
        console.error("Error parsing user from localStorage", error);
        localStorage.removeItem('skillswap-user'); // Clear corrupted data
        return null;
    }
};


const authService = {
    signup,
    login,
    logout,
    getCurrentUser,
};

export default authService;