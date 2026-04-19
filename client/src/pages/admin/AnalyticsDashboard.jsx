// client/src/pages/admin/AnalyticsDashboard.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import analyticsService from '../../services/analyticsService';
import { Bar, Line } from 'react-chartjs-2';
import 'chart.js/auto';
import { saveAs } from 'file-saver';

const AnalyticsDashboard = () => {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [projectStats, setProjectStats] = useState({ statusCounts: [], perDay: [] });
  const [freelancerStats, setFreelancerStats] = useState([]);

  const fetchData = async () => {
    const params = {};
    if (dateFrom) params.dateFrom = dateFrom;
    if (dateTo)   params.dateTo = dateTo;

    const proj = await analyticsService.getProjectAnalytics(params);
    setProjectStats(proj);

    const free = await analyticsService.getFreelancerAnalytics(params);
    setFreelancerStats(free.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const exportReport = async (format) => {
    const blob = await analyticsService.exportAnalytics(format);
    saveAs(blob, `analytics.${format}`);
  };

  // Prepare chart data
  const barData = {
    labels: projectStats.statusCounts.map(r => r._id),
    datasets: [{
      label: 'Projects by Status',
      data: projectStats.statusCounts.map(r => r.count)
    }]
  };
  const lineData = {
    labels: projectStats.perDay.map(r => r._id),
    datasets: [{ label: 'Projects/day', data: projectStats.perDay.map(r => r.count) }]
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Basic Analytics Dashboard</h1>
        <div>
          <Link to="/admin/enhanced-analytics" className="bg-indigo-600 text-white px-4 py-2 rounded mr-2" style={{ color: 'white', textDecoration: 'none' }}>
            Advanced Analytics
          </Link>
          <Link to="/admin/dashboard" className="bg-indigo-600 text-white px-4 py-2 rounded" style={{ color: 'white', textDecoration: 'none' }}>
            Back to Dashboard
          </Link>
        </div>
      </div>

      <div className="mb-4 flex space-x-4">
        <div>
          <label>Date From:</label>
          <input type="date" value={dateFrom}
                 onChange={e => setDateFrom(e.target.value)}
                 className="border px-2 py-1 ml-2"/>
        </div>
        <div>
          <label>Date To:</label>
          <input type="date" value={dateTo}
                 onChange={e => setDateTo(e.target.value)}
                 className="border px-2 py-1 ml-2"/>
        </div>
        <button
          onClick={fetchData}
          className="bg-indigo-600 text-white px-4 py-1 rounded"
        >
          Refresh
        </button>
        <button
          onClick={() => exportReport('csv')}
          className="bg-green-600 text-white px-4 py-1 rounded"
        >
          Export CSV
        </button>
        <button
          onClick={() => exportReport('pdf')}
          className="bg-red-600 text-white px-4 py-1 rounded"
        >
          Export PDF
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <Bar data={barData}/>
        </div>
        <div>
          <Line data={lineData}/>
        </div>
      </div>

      <section className="mt-8">
        <h2 className="text-2xl mb-4">Freelancer Performance</h2>
        <table className="min-w-full bg-white">
          <thead><tr>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Avg Rating</th>
            <th className="px-4 py-2"># Projects</th>
          </tr></thead>
          <tbody>
            {freelancerStats.map(f => (
              <tr key={f._id} className="border-t">
                <td className="px-4 py-2">{f.name}</td>
                <td className="px-4 py-2">{f.averageRating.toFixed(1)}</td>
                <td className="px-4 py-2">{f.totalProjects}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default AnalyticsDashboard;
