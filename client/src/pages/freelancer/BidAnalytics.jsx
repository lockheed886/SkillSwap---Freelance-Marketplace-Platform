// client/src/pages/freelancer/BidAnalytics.jsx
import React, { useEffect, useState } from 'react';
import bidService from '../../services/bidService';
import { Bar } from 'react-chartjs-2';

const BidAnalytics = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    bidService.getMyBidAnalytics()
      .then(data => setStats(data))
      .catch(err => setError(err.message));
  }, []);

  if (error) return <p className="text-red-500">{error}</p>;
  if (!stats) return <p>Loading analytics…</p>;

  const chartData = {
    labels: stats.byStatus.map(s => s.status),
    datasets: [{
      label: 'Bids by Status',
      data: stats.byStatus.map(s => s.count),
      backgroundColor: 'rgba(54, 162, 235, 0.5)',
    }]
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">My Bid Analytics</h2>
      <p>Total Bids: {stats.totalBids}</p>
      <p>Average Bid Amount: ${stats.averageAmount.toFixed(2)}</p>
      <div className="mt-6">
        <Bar data={chartData} />
      </div>
    </div>
  );
};

export default BidAnalytics;
