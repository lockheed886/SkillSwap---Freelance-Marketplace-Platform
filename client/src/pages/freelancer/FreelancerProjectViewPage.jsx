// client/src/pages/freelancer/FreelancerProjectViewPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import projectService from '../../services/projectService';
import ProjectTimeline from '../../components/freelancer/ProjectTimeline';
import { useAuth } from '../../context/AuthContext';
import { formatDate, StatusBadge } from '../../utils/displayHelpers'; // For displaying status and dates

const FreelancerProjectViewPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const handleMilestoneUpdate = async (updatedProjectId, milestoneId, newStatus) => {
    console.log(`Milestone ${milestoneId} in project ${updatedProjectId} updated to ${newStatus}`);
    try {
      // Refetch project to get the latest milestone states and update the UI
      const projData = await projectService.getProjectById(updatedProjectId);
      setProject(projData);
    } catch (err) {
      console.error("Failed to refresh project after milestone update:", err);
      setError('Failed to update project details after milestone change.');
    }
  };

  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (!projectId || !user) {
        setLoading(false);
        setError("Project ID or user information is missing.");
        return;
      }
      try {
        setLoading(true);
        setError(''); // Clear previous errors
        const projData = await projectService.getProjectById(projectId);

        // Security/Logic Check: Ensure the current freelancer is assigned to this project
        // And that the project is in a state where timeline management is relevant
        // This check is moved down to after project is confirmed to exist.
        setProject(projData);
      } catch (err) {
        console.error("Detailed error fetching project details for ID:", projectId, err);
        let displayError = 'Failed to load project details.';
        if (err.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error("Error response data:", err.response.data);
          console.error("Error response status:", err.response.status);
          // Use the message from the backend if available, otherwise a generic server error
          displayError = err.response.data?.message || `Server error: ${err.response.status}. Please try again.`;
        } else if (err.request) {
          // The request was made but no response was received
          console.error("Error request data:", err.request);
          displayError = 'No response from server. Please check your network connection.';
        } else {
          // Something happened in setting up the request that triggered an Error
          displayError = err.message || 'An unexpected error occurred while trying to fetch project details.';
        }
        setError(displayError);
        setProject(null); // Ensure project is null if fetch fails
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [projectId, user]); // user dependency to refetch if user changes (e.g. re-login)

  if (loading) return <div className="text-center p-8">Loading project details…</div>;
  // Error display is now more specific
  if (error) return <div className="text-center p-8 text-red-500 bg-red-100 rounded">{error}</div>;
  if (!project) return <div className="text-center p-8">Project data is not available or could not be loaded.</div>; // Adjusted message

  // Further check to ensure only assigned freelancer sees the timeline management for relevant statuses
  // This check should only run if project is successfully loaded
  if (!project.freelancerId || project.freelancerId._id !== user?._id || !['in_progress', 'completed', 'work_submitted', 'disputed'].includes(project.status)) {
    return (
        <div className="max-w-2xl mx-auto p-4 text-center">
            <h1 className="text-2xl font-bold mb-2 text-gray-800">{project.title}</h1>
            <p className="text-red-600 bg-red-100 p-3 rounded my-4">
                You are not assigned to this project, or it is not in a state that allows timeline management.
            </p>
            <button
                onClick={() => navigate('/freelancer/dashboard')}
                className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
                style={{ color: 'white', textDecoration: 'none' }}
            >
                Back to Dashboard
            </button>
        </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <button
        onClick={() => navigate(-1)}
        className="text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded mb-6 inline-flex items-center"
        style={{ color: 'white', textDecoration: 'none' }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        Back
      </button>

      <div className="bg-white shadow-xl rounded-lg p-6 mb-8">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-800 truncate" title={project.title}>{project.title}</h1>
          <StatusBadge status={project.status} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-6">
          <p><strong>Client:</strong> {project.client?.name || 'N/A'}</p>
          {project.deadline && <p><strong>Deadline:</strong> {formatDate(project.deadline)}</p>}
          <p><strong>Budget:</strong> {project.budget != null ? `$${project.budget.toFixed(2)} (${project.budgetType || 'Fixed'})` : 'Undecided'}</p>
        </div>
        {project.description && (
            <div>
                <h2 className="text-xl font-semibold text-gray-700 mb-2">Project Description</h2>
                <p className="text-gray-600 whitespace-pre-wrap">{project.description}</p>
            </div>
        )}
      </div>

      {/* Project Timeline is the core part of this page for in-progress projects */}
      <ProjectTimeline project={project} onUpdateMilestone={handleMilestoneUpdate} />

      {/* Future enhancements: Communication logs, file sharing specific to this project, etc. */}
    </div>
  );
};

export default FreelancerProjectViewPage;
