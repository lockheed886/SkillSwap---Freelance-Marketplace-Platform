// client/src/pages/freelancer/FreelancerTimelineOverviewPage.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import projectService from '../../services/projectService';
import { useAuth } from '../../context/AuthContext';
import { formatDate, StatusBadge } from '../../utils/displayHelpers.jsx';

const FreelancerTimelineOverviewPage = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        const fetchInProgressProjects = async () => {
            if (!user || user.role !== 'freelancer') {
                setLoading(false);
                setError("User not authorized or not a freelancer.");
                return;
            }
            try {
                setLoading(true);
                // Use getFreelancerProjects with a status filter.
                // The backend service already filters by freelancerId.
                const inProgressProjectsData = await projectService.getFreelancerProjects({ status: 'in_progress' });
                setProjects(inProgressProjectsData || []); // Ensure projects is an array
            } catch (err) {
                setError(err.message || 'Failed to load projects for timeline.');
                console.error("Error fetching in-progress projects:", err);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchInProgressProjects();
        }
    }, [user]);

    if (loading) return <div className="text-center p-8">Loading project timelines...</div>;
    if (error) return <div className="text-center p-8 text-red-500 bg-red-100 p-3 rounded">{error}</div>;

    return (
        <div className="container mx-auto p-4">
            <button
                onClick={() => navigate('/freelancer/dashboard')}
                className="text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded mb-6 inline-block"
            >
                &larr; Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold mb-8 text-gray-800">Active Project Timelines</h1>
            {projects.length === 0 ? (
                <div className="text-center py-10">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No active projects</h3>
                    <p className="mt-1 text-sm text-gray-500">You have no projects currently in progress.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <div key={project._id} className="bg-white shadow-lg rounded-xl p-6 hover:shadow-xl transition-shadow duration-300 ease-in-out">
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="text-xl font-semibold text-indigo-700 truncate" title={project.title}>{project.title}</h2>
                                <StatusBadge status={project.status} />
                            </div>
                            <p className="text-sm text-gray-600 mb-2 h-10 overflow-hidden">{project.description}</p>
                            <div className="text-sm text-gray-500 mb-4 space-y-1">
                                <p><strong>Deadline:</strong> {formatDate(project.deadline)}</p>
                                <p><strong>Budget:</strong> {project.budget != null ? `$${project.budget.toFixed(2)} (${project.budgetType || 'Fixed'})` : 'Undecided'}</p>
                            </div>
                            <Link
                                to={`/freelancer/project/${project._id}/timeline`} // Corrected Link
                                className="w-full block text-center bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors duration-200 text-sm font-medium"
                                style={{ color: 'white', textDecoration: 'none' }}
                            >
                                View Timeline & Manage
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FreelancerTimelineOverviewPage;
