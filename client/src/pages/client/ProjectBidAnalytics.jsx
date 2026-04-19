import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import bidService from '../../services/bidService';

const ProjectBidAnalytics = () => {
  const { projectId } = useParams();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    bidService.getProjectBidAnalytics(projectId)
      .then(data => setStats(data))
      .catch(err => setError(err.message));
  }, [projectId]);

  if (error) return <p className="text-red-500">{error}</p>;
  if (!stats) return <p>Loading analytics…</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Project Bid Analytics</h2>
      <ul className="space-y-2">
        <li><strong>Total Bids:</strong> {stats.totalBids}</li>
        <li><strong>Average Amount:</strong> ${stats.avgAmount.toFixed(2)}</li>
        <li><strong>Min Amount:</strong> ${stats.minAmount.toFixed(2)}</li>
        <li><strong>Max Amount:</strong> ${stats.maxAmount.toFixed(2)}</li>
      </ul>
      <h3 className="mt-6 text-xl font-semibold">Bids by Status</h3>
      <ul className="space-y-1">
        {Object.entries(stats.statusCounts).map(([status, count]) => (
          <li key={status}>
            <span className="capitalize">{status.replace('_',' ')}:</span> {count}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProjectBidAnalytics;
