// client/src/services/freelancerService.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL + '/freelancers';

// Find freelancers based on filter criteria
const findFreelancers = async (params = {}) => {
    try {
        // Axios automatically converts the params object into query string parameters
        const response = await axios.get(API_URL, { params });
        return response.data; // Expecting { freelancers: [...] } or similar
    } catch (error) {
        console.error("Error finding freelancers:", error);
        // Rethrow a more specific error or the original one
        throw new Error(error.response?.data?.message || 'Failed to fetch freelancers');
    }
};

// Add other freelancer-related service functions later (e.g., get profile by ID)

const freelancerService = {
    findFreelancers,
};

export default freelancerService;