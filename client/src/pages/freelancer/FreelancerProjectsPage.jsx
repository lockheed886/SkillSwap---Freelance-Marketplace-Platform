// client/src/pages/freelancer/FreelancerProjectsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import projectService from '../../services/projectService';
import { StatusBadge, formatDate } from '../../utils/displayHelpers.jsx';

const FreelancerProjectsPage = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({ status: '', category: '' });
    const navigate = useNavigate();

    const fetchFreelancerProjects = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const params = {};
            if (filters.status) params.status = filters.status;
            if (filters.category) params.category = filters.category;
            const data = await projectService.getFreelancerProjects(params);
            setProjects(data || []);
        } catch (err) {
            setError(err.message || 'Failed to load projects');
            setProjects([]);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchFreelancerProjects();
    }, [fetchFreelancerProjects]);

    const handleFilterChange = (e) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmitWork = async (projectId) => {
        if (window.confirm('Are you sure you want to submit your work for this project?')) {
            try {
                await projectService.submitWork(projectId); // Changed from markComplete to submitWork
                alert('Work submitted successfully!'); // Updated alert message
                fetchFreelancerProjects(); // Refresh the project list
            } catch (err) {
                alert(err.message || 'Failed to submit work.');
            }
        }
    };

    const projectStatuses = ['in_progress', 'completed', 'cancelled'];

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">My Projects</h1>

            {/* Filters */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg shadow grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                        id="status"
                        name="status"
                        value={filters.status}
                        onChange={handleFilterChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                        <option value="">All Statuses</option>
                        {projectStatuses.map(s => <option key={s} value={s}>{s.replace('_', ' ').toUpperCase()}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <input
                        type="text"
                        id="category"
                        name="category"
                        value={filters.category}
                        onChange={handleFilterChange}
                        placeholder="Type to search category (e.g., Design)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
                <button
                    onClick={fetchFreelancerProjects}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 h-10"
                >
                    Search
                </button>
            </div>

            {loading && <p className="text-center text-gray-500">Loading your projects...</p>}
            {error && <p className="text-center text-red-500 bg-red-100 p-3 rounded">{error}</p>}
            {!loading && !error && projects.length === 0 && (
                <p className="text-center text-gray-500 mt-10">You have no projects matching the current filters.</p>
            )}

            {!loading && !error && projects.length > 0 && (
                <div className="bg-white shadow sm:rounded-md">
                    <ul role="list" className="divide-y divide-gray-200">
                        {projects.map((project) => (
                            <li key={project._id}>
                                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium text-indigo-600 truncate">
                                            {project.title}
                                        </p>
                                        <StatusBadge status={project.status} />
                                    </div>
                                    <div className="mt-2 sm:flex sm:justify-between">
                                        <div className="sm:flex">
                                            <p className="flex items-center text-sm text-gray-500 mr-6">
                                                Deadline: {formatDate(project.deadline)}
                                            </p>
                                            {project.budget != null && (
                                                <p className="flex items-center text-sm text-gray-500">
                                                    Budget: ${project.budget.toFixed(2)}
                                                </p>
                                            )}
                                        </div>
                                        <div className="mt-2 flex items-center text-sm space-x-4">
                                            <button
                                                onClick={() => navigate(`/freelancer/project/${project._id}/details`)} // Navigate to project details page
                                                className="text-indigo-600 hover:underline"
                                            >
                                                View Details
                                            </button>
                                            {project.status === 'in_progress' && (
                                                <button
                                                    onClick={() => handleSubmitWork(project._id)}
                                                    className="text-green-600 hover:underline"
                                                >
                                                    Submit Work
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default FreelancerProjectsPage;
