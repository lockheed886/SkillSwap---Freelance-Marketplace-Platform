// client/src/pages/client/MyProjectsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import projectService from '../../services/projectService';

// Helper to format dates
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString(undefined, {
        year: 'numeric', month: 'short', day: 'numeric'
    });
};

// Helper to display status badges
const StatusBadge = ({ status }) => {
    let bgColor = 'bg-gray-100', textColor = 'text-gray-800';
    switch (status?.toLowerCase()) {
        case 'open':           bgColor = 'bg-blue-100';   textColor = 'text-blue-800';   break;
        case 'in_progress':    bgColor = 'bg-yellow-100'; textColor = 'text-yellow-800'; break;
        case 'pending_selection': bgColor = 'bg-purple-100'; textColor = 'text-purple-800'; break;
        case 'work_submitted': bgColor = 'bg-teal-100';   textColor = 'text-teal-800';   break; // Added for work_submitted
        case 'completed':      bgColor = 'bg-green-100';  textColor = 'text-green-800';  break;
        case 'cancelled':
        case 'disputed':       bgColor = 'bg-red-100';    textColor = 'text-red-800';    break;
        default: status = 'Unknown';
    }
    return (
        <span className={`px-2 py-0.5 inline-flex text-xs font-semibold rounded-full ${bgColor} ${textColor} capitalize`}>
            {status.replace('_', ' ')}
        </span>
    );
};

const MyProjectsPage = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const fetchProjects = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const data = await projectService.getMyProjects();
            setProjects(data || []);
        } catch (err) {
            setError(err.message || 'Failed to load projects');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    const handleMarkComplete = async (projectId) => {
        try {
            await projectService.markComplete(projectId);
            fetchProjects();
        } catch (err) {
            alert(err.message || 'Failed to mark complete');
        }
    };

    const handleDelete = async (projectId) => {
        if (!window.confirm('Are you sure you want to delete this project?')) return;
        try {
            await projectService.deleteProject(projectId);
            fetchProjects();
            alert('Project deleted successfully.');
        } catch (err) {
            alert(err.message || 'Failed to delete project.');
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">My Projects</h1>
                <Link
                    to="/client/create-project"
                    className="inline-flex py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded"
                    style={{ color: 'white', textDecoration: 'none' }}
                >
                    + Post New Project
                </Link>
            </div>

            {loading && <p className="text-center text-gray-500">Loading your projects...</p>}
            {error && <p className="text-center text-red-500 bg-red-100 p-3 rounded">{error}</p>}
            {!loading && !error && projects.length === 0 && (
                <p className="text-center text-gray-500 mt-10">You haven't posted any projects yet.</p>
            )}

            {!loading && !error && projects.length > 0 && (
                <div className="bg-white shadow sm:rounded-md">
                    <ul role="list" className="divide-y divide-gray-200">
                        {projects.map((project) => (
                            <li key={project._id}>
                                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                                    <div className="flex items-center justify-between">
                                        <p
                                            className={`text-sm font-medium text-indigo-600 truncate ${project.status === 'open' ? 'hover:underline cursor-pointer' : 'cursor-default'}`}
                                            onClick={() => project.status === 'open' && navigate(`/client/edit-project/${project._id}`)}
                                            title={project.status !== 'open' ? "Project cannot be edited when not in 'open' status" : project.title}
                                        >
                                            {project.title}
                                        </p>
                                        <StatusBadge status={project.status} />
                                    </div>
                                    <div className="mt-2 sm:flex sm:justify-between">
                                        <div className="sm:flex">
                                            <p className="flex items-center text-sm text-gray-500 mr-6">
                                                Deadline: {formatDate(project.deadline)}
                                            </p>
                                            {project.budget && (
                                                <p className="flex items-center text-sm text-gray-500">
                                                    Budget: ${project.budget.toFixed(2)}
                                                </p>
                                            )}
                                        </div>
                                        <div className="mt-2 flex items-center space-x-4 text-sm">
                                            <button
                                                onClick={() => navigate(`/client/edit-project/${project._id}`)}
                                                className={`text-indigo-600 hover:underline ${project.status !== 'open' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                disabled={project.status !== 'open'}
                                                title={project.status !== 'open' ? "Cannot edit project unless status is 'open'" : "Edit project"}
                                            >
                                                Edit
                                            </button>
                                            {['open','cancelled'].includes(project.status) && (
                                            <button
                                                onClick={() => handleDelete(project._id)}
                                                className="text-red-600 hover:underline"
                                            >
                                                Delete
                                            </button>
                                            )}
                                            {project.status === 'work_submitted' && (
                                            <button
                                                onClick={() => handleMarkComplete(project._id)}
                                                className="text-green-600 hover:underline"
                                            >
                                                Mark as Complete
                                            </button>
                                            )}
                                            {project.status === 'in_progress' && (
                                            <button
                                                onClick={() => handleMarkComplete(project._id)}
                                                className="text-green-600 hover:underline"
                                            >
                                                Mark Complete
                                            </button>
                                            )}
                                            {project.status === 'completed' && !project.reviewed && (
                                            <button
                                                onClick={() => navigate(`/client/project/${project._id}/review`)}
                                                className="text-indigo-600 hover:underline"
                                            >
                                                Leave Review
                                            </button>
                                            )}
                                            {/* — New Analytics Button — */}
                                            <button
                                                onClick={() => navigate(`/client/project/${project._id}/analytics`)}
                                                className="text-purple-600 hover:underline"
                                            >
                                                Analytics
                                            </button>
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

export default MyProjectsPage;
