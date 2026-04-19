// client/src/pages/freelancer/ProjectBiddingPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import projectService from '../../services/projectService';
import bidService from '../../services/bidService';
import BidForm from '../../components/freelancer/BidForm';
import ProjectTimeline from '../../components/freelancer/ProjectTimeline';

const ProjectBiddingPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [existingBid, setExistingBid] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Safely get current user ID
  let currentUserId = null;
  try {
    const userStr = localStorage.getItem('skillswap-user');
    if (userStr) {
      const currentUser = JSON.parse(userStr);
      currentUserId = currentUser?._id;
    }
  } catch (e) {
    console.error("Failed to parse user from localStorage", e);
    // Not setting a page-level error here, currentUserId will be null
    // and features depending on it will be gracefully disabled or adapt.
  }

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const proj = await projectService.getPublicProjectById(projectId);
        if (!proj) {
          setError('Project not found.');
          setProject(null);
        } else {
          setProject(proj);
        }

        // Fetch existing bid only if project was loaded and user is identified
        if (proj && currentUserId) {
          try {
            // Ensure this freelancer is viewing their own bid details if applicable
            const bids = await bidService.getBidsForProject(projectId); // This might fetch all bids
            const myBid = bids.find(b => b.freelancerId?._id === currentUserId);
            setExistingBid(myBid || null);
          } catch (bidError) {
            console.warn('Could not fetch existing bid:', bidError.message);
            setExistingBid(null); // Reset in case of error
          }
        } else {
          setExistingBid(null); // No project or no user, so no existing bid to check
        }
      } catch (err) {
        setError(err.message || 'Failed to load project details.');
        setProject(null); // Ensure project is null on error
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      load();
    } else {
      setError("Project ID is missing.");
      setLoading(false);
    }
  }, [projectId]); // currentUserId is derived from localStorage, not a reactive dependency here.

  const handleWithdraw = async () => {
    if (!window.confirm('Withdraw your bid?')) return;
    try {
      await bidService.withdrawBid(projectId, existingBid._id);
      alert('Bid withdrawn');
      setExistingBid(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const onBidSubmitted = (newBid) => {
    setExistingBid(newBid);
  };

  // Callback for when a milestone is updated in ProjectTimeline
  const handleMilestoneUpdate = async (updatedProjectId, milestoneId, newStatus) => {
    // Optionally, you can refresh the project data or handle UI updates here
    console.log(`Milestone ${milestoneId} in project ${updatedProjectId} updated to ${newStatus}`);
    // Example: refetch project to get the latest milestone states
    try {
      const proj = await projectService.getProjectById(updatedProjectId);
      setProject(proj); // This will pass updated milestones to ProjectTimeline
    } catch (err) {
      console.error("Failed to refresh project after milestone update:", err);
    }
  };

  if (loading) return <div className="text-center p-8">Loading project details…</div>;
  if (error) return <div className="text-center p-8 text-red-500 bg-red-100 p-3 rounded">{error}</div>;
  if (!project) return <div className="text-center p-8">Project data is not available.</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <button onClick={() => navigate(-1)} className="underline mb-4">&larr; Back</button>
      <h1 className="text-2xl font-bold mb-2">{project.title}</h1>
      <p className="mb-4 text-gray-700">{project.description}</p>
      <dl className="mb-6">
        <dt className="font-semibold">Requirements</dt>
        <dd className="mb-2">{project.requirements || '–'}</dd>
        <dt className="font-semibold">Category</dt>
        <dd className="mb-2">{project.category}</dd>
        <dt className="font-semibold">Budget</dt>
        <dd className="mb-2">{project.budget ? `$${project.budget}` : 'Open budget'}</dd>
        <dt className="font-semibold">Deadline</dt>
        <dd>{new Date(project.deadline).toLocaleDateString()}</dd>
      </dl>

      {/* Conditionally render BidForm or ProjectTimeline based on bid status and project assignment */}
      {project.status === 'in_progress' && project.freelancerId === currentUserId ? (
        <ProjectTimeline project={project} onUpdateMilestone={handleMilestoneUpdate} />
      ) : existingBid && existingBid.status !== 'withdrawn' ? (
        <div className="bg-yellow-50 p-4 rounded border mb-6">
          <h2 className="font-semibold mb-2">Your Bid</h2>
          <p><strong>Amount:</strong> ${existingBid.amount.toFixed(2)}</p>
          <p><strong>Duration:</strong> {existingBid.estimatedDuration || '–'}</p>
          <p className="mt-2"><strong>Message:</strong> {existingBid.message}</p>
          <p className="mt-2"><strong>Status:</strong> {existingBid.status.replace('_',' ')}</p>
          { existingBid.status === 'pending' || existingBid.status === 'counter_offered' ? (
            <button
              onClick={handleWithdraw}
              className="mt-4 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
            >
              Withdraw Bid
            </button>
          ) : (
            <p className="mt-2 text-sm text-gray-600">Your bid has been {existingBid.status.replace('_', ' ')}.</p>
          )}
        </div>
      ) : project.status === 'open' ? (
        <BidForm projectId={projectId} onBidSubmitted={onBidSubmitted} />
      ) : (
        <p className="text-center text-gray-500 mt-6">Bidding is closed for this project or you are not eligible to bid.</p>
      )}
    </div>
  );
};

export default ProjectBiddingPage;
