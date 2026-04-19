// client/src/services/projectService.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL + '/projects';

// Helper to get the auth token from local storage
const getAuthHeaders = () => {
    const userStr = localStorage.getItem('skillswap-user');
    const user = userStr ? JSON.parse(userStr) : null;
    if (user && user.token) {
        return { Authorization: `Bearer ${user.token}` };
    }
    return {};
};

// Create a new project
const createProject = async (projectData) => {
    try {
        const config = { headers: getAuthHeaders() };
        const response = await axios.post(API_URL, projectData, config);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to create project');
    }
};

// Get projects for the current client
const getMyProjects = async () => {
    try {
        const config = { headers: getAuthHeaders() };
        const response = await axios.get(API_URL, config);
        return response.data;
    } catch (error) {
         throw new Error(error.response?.data?.message || 'Failed to fetch projects');
    }
};

// Get a single project by ID
const getProjectById = async (id) => {
     try {
        const config = { headers: getAuthHeaders() };
        const response = await axios.get(`${API_URL}/${id}`, config);
        return response.data;
    } catch (error) {
         throw new Error(error.response?.data?.message || 'Failed to fetch project details');
    }
};

// New function for public project details (for freelancers)
const getPublicProjectById = async (id) => {
    try {
        const config = { headers: getAuthHeaders() };
        // Note the /public path
        const response = await axios.get(`${API_URL}/${id}/public`, config);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch public project details');
    }
};

// Update a project
const updateProject = async (id, projectData) => {
    try {
        const config = { headers: getAuthHeaders() };
        const response = await axios.put(`${API_URL}/${id}`, projectData, config);
        return response.data;
    } catch (error) {
         throw new Error(error.response?.data?.message || 'Failed to update project');
    }
};

// Delete a project
const deleteProject = async (id) => {
    try {
        const config = { headers: getAuthHeaders() };
        const response = await axios.delete(`${API_URL}/${id}`, config);
        return response.data; // Usually a { message: "..." }
    } catch (error) {
         throw new Error(error.response?.data?.message || 'Failed to delete project');
    }
};
export async function getOpenProjects() {
    const config = { headers: getAuthHeaders() };
    // 👇 point at /api/projects/open, not /api/projects/projects/open
    const { data } = await axios.get(
      `${API_URL}/open`,
      config
    );
    return data;
  }

// Get projects for the current freelancer
const getFreelancerProjects = async (params = {}) => {
    try {
        const config = { headers: getAuthHeaders(), params }; // Pass params for filtering
        const response = await axios.get(`${API_URL}/freelancer/projects`, config);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch freelancer projects');
    }
};

// Client marks a project as complete
const markComplete = async (projectId) => {
    try {
        const config = { headers: getAuthHeaders() };
        const response = await axios.put(`${API_URL}/${projectId}/complete`, {}, config); // Send PUT to /api/projects/:id/complete
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to mark project as complete');
    }
};

// Freelancer submits work for a project
const submitWork = async (projectId, submissionData = {}) => {
    try {
        const config = { headers: getAuthHeaders() };
        const response = await axios.put(`${API_URL}/${projectId}/submit-work`, submissionData, config);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to submit work');
    }
};

// Update a milestone's status
const updateMilestoneStatus = async (projectId, milestoneId, statusUpdate) => {
    try {
        const config = { headers: getAuthHeaders() };
        const response = await axios.put(`${API_URL}/${projectId}/milestones/${milestoneId}`, statusUpdate, config);
        if (response.status === 404) {
            throw new Error('Milestone or Project not found. Please verify the IDs.');
        }
        return response.data;
    } catch (error) {
        console.error('Error updating milestone status:', error);
        throw new Error(error.response?.data?.message || 'Failed to update milestone status');
    }
};

const projectService = {
    createProject,
    getMyProjects,
    getProjectById, // Stays for client use
    getPublicProjectById, // New function
    updateProject,
    deleteProject,
    getOpenProjects,
    getFreelancerProjects, // Added function
    submitWork, // Add submitWork to exports
    markComplete, // Add markComplete to exports
    updateMilestoneStatus, // Add updateMilestoneStatus to exports
};

export default projectService;