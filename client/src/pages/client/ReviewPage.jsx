// client/src/pages/review/ReviewPage.jsx

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import projectService from '../../services/projectService';
import ReviewForm from '../../components/review/ReviewForm';
import ReviewList from '../../components/review/ReviewList';
import StarRating from '../../components/common/SttarRating';


export default function ReviewPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const p = await projectService.getProjectById(projectId);
        if (p.status !== 'completed') {
          alert('Can only review completed projects');
          return navigate('/client/my-projects');
        }
        setProject(p);
      } catch {
        navigate('/client/my-projects');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [projectId]);

  if (loading) return <p>Loading…</p>;
  if (!project) return null;

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">Review {project.title}</h1>
      <div className="mb-6 p-4 bg-white rounded shadow">
        <p>Freelancer: <strong>{project.freelancerId.name}</strong></p>
        <StarRating rating={project.freelancerId.averageRating} />
      </div>

      <ReviewForm
        projectId={project._id}
        freelancerId={project.freelancerId._id}
        onReviewSubmitted={() => {}}
      />

      <h2 className="text-xl font-semibold mt-8 mb-4">All Reviews</h2>
      <ReviewList freelancerId={project.freelancerId._id} />
    </div>
  );
}
