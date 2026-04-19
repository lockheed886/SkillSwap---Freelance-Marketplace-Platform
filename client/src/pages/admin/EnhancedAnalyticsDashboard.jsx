// client/src/pages/admin/EnhancedAnalyticsDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import analyticsService from '../../services/analyticsService';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
import 'chart.js/auto';
import { saveAs } from 'file-saver';
import { formatCurrency, formatNumber } from '../../utils/displayHelpers';

const EnhancedAnalyticsDashboard = () => {
  const [activeTab, setActiveTab] = useState('user-growth');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [interval, setInterval] = useState('day');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Data states
  const [userGrowthData, setUserGrowthData] = useState(null);
  const [skillsData, setSkillsData] = useState(null);
  const [transactionData, setTransactionData] = useState(null);
  const [revenueData, setRevenueData] = useState(null);

  useEffect(() => {
    if (activeTab === 'user-growth') {
      fetchUserGrowthData();
    } else if (activeTab === 'skills') {
      fetchSkillsData();
    } else if (activeTab === 'transactions') {
      fetchTransactionData();
    } else if (activeTab === 'revenue') {
      fetchRevenueData();
    }
  }, [activeTab]);

  const fetchUserGrowthData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { interval };
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;

      const data = await analyticsService.getUserGrowthAnalytics(params);
      setUserGrowthData(data);
    } catch (err) {
      setError('Failed to fetch user growth data: ' + (err.message || 'Unknown error'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSkillsData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await analyticsService.getPopularSkillsAnalytics();
      setSkillsData(data);
    } catch (err) {
      setError('Failed to fetch skills data: ' + (err.message || 'Unknown error'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactionData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;

      const data = await analyticsService.getTransactionAnalytics(params);
      setTransactionData(data);
    } catch (err) {
      setError('Failed to fetch transaction data: ' + (err.message || 'Unknown error'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRevenueData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await analyticsService.getRevenueAnalytics();
      setRevenueData(data);
    } catch (err) {
      setError('Failed to fetch revenue data: ' + (err.message || 'Unknown error'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const exportData = async (format, type) => {
    try {
      const blob = await analyticsService.exportAnalytics(format, type);
      saveAs(blob, `analytics-${type}.${format}`);
    } catch (err) {
      setError('Failed to export data: ' + (err.message || 'Unknown error'));
      console.error(err);
    }
  };

  const prepareUserGrowthChart = () => {
    if (!userGrowthData || !userGrowthData.growth) return null;

    // Group data by role
    const roleData = {};
    userGrowthData.growth.forEach(item => {
      const role = item._id.role;
      if (!roleData[role]) {
        roleData[role] = [];
      }
      roleData[role].push({
        date: item._id.date,
        count: item.count
      });
    });

    // Get unique dates
    const dates = [...new Set(userGrowthData.growth.map(item => item._id.date))].sort();

    // Prepare datasets
    const datasets = Object.keys(roleData).map((role, index) => {
      const colors = ['#4C51BF', '#38A169', '#E53E3E'];
      const data = dates.map(date => {
        const entry = roleData[role].find(item => item.date === date);
        return entry ? entry.count : 0;
      });

      return {
        label: role.charAt(0).toUpperCase() + role.slice(1),
        data,
        backgroundColor: colors[index % colors.length],
        borderColor: colors[index % colors.length],
        borderWidth: 1,
        fill: false
      };
    });

    return {
      labels: dates,
      datasets
    };
  };

  const prepareSkillsChart = () => {
    if (!skillsData) return null;

    const freelancerSkillsData = {
      labels: skillsData.freelancerSkills.map(skill => skill._id),
      datasets: [
        {
          label: 'Freelancer Skills',
          data: skillsData.freelancerSkills.map(skill => skill.count),
          backgroundColor: 'rgba(76, 81, 191, 0.6)',
          borderColor: 'rgba(76, 81, 191, 1)',
          borderWidth: 1
        }
      ]
    };

    const projectSkillsData = {
      labels: skillsData.projectSkills.map(skill => skill._id),
      datasets: [
        {
          label: 'Project Skills',
          data: skillsData.projectSkills.map(skill => skill.count),
          backgroundColor: 'rgba(56, 161, 105, 0.6)',
          borderColor: 'rgba(56, 161, 105, 1)',
          borderWidth: 1
        }
      ]
    };

    const skillRatesData = {
      labels: skillsData.skillRates.map(skill => skill._id),
      datasets: [
        {
          label: 'Average Hourly Rate',
          data: skillsData.skillRates.map(skill => skill.avgRate),
          backgroundColor: 'rgba(229, 62, 62, 0.6)',
          borderColor: 'rgba(229, 62, 62, 1)',
          borderWidth: 1
        }
      ]
    };

    return {
      freelancerSkills: freelancerSkillsData,
      projectSkills: projectSkillsData,
      skillRates: skillRatesData
    };
  };

  const prepareTransactionChart = () => {
    if (!transactionData) return null;

    const statusData = {
      labels: transactionData.projectValueByStatus.map(item => item._id),
      datasets: [
        {
          label: 'Total Value',
          data: transactionData.projectValueByStatus.map(item => item.totalValue),
          backgroundColor: 'rgba(76, 81, 191, 0.6)',
          borderColor: 'rgba(76, 81, 191, 1)',
          borderWidth: 1
        }
      ]
    };

    const categoryData = {
      labels: transactionData.projectValueByCategory.map(item => item._id),
      datasets: [
        {
          label: 'Total Value',
          data: transactionData.projectValueByCategory.map(item => item.totalValue),
          backgroundColor: 'rgba(56, 161, 105, 0.6)',
          borderColor: 'rgba(56, 161, 105, 1)',
          borderWidth: 1
        }
      ]
    };

    return {
      statusData,
      categoryData
    };
  };

  const prepareRevenueChart = () => {
    if (!revenueData || !revenueData.completedProjectsByMonth) return null;

    const monthlyData = {
      labels: revenueData.completedProjectsByMonth.map(item => item.yearMonth),
      datasets: [
        {
          label: 'Estimated Revenue',
          data: revenueData.completedProjectsByMonth.map(item => item.estimatedRevenue),
          backgroundColor: 'rgba(76, 81, 191, 0.6)',
          borderColor: 'rgba(76, 81, 191, 1)',
          borderWidth: 1,
          fill: false
        }
      ]
    };

    const projectionData = {
      labels: ['Completed', 'In Progress', 'Open'],
      datasets: [
        {
          label: 'Potential Revenue',
          data: [
            revenueData.completedProjectsByMonth.reduce((sum, item) => sum + item.estimatedRevenue, 0),
            revenueData.inProgressProjects.potentialRevenue || 0,
            revenueData.openProjects.potentialRevenue || 0
          ],
          backgroundColor: [
            'rgba(56, 161, 105, 0.6)',
            'rgba(76, 81, 191, 0.6)',
            'rgba(229, 62, 62, 0.6)'
          ],
          borderColor: [
            'rgba(56, 161, 105, 1)',
            'rgba(76, 81, 191, 1)',
            'rgba(229, 62, 62, 1)'
          ],
          borderWidth: 1
        }
      ]
    };

    return {
      monthlyData,
      projectionData
    };
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Enhanced Analytics Dashboard</h1>
        <Link to="/admin/dashboard" className="bg-indigo-600 text-white px-4 py-2 rounded" style={{ color: 'white', textDecoration: 'none' }}>
          Back to Dashboard
        </Link>
      </div>

      <div className="mb-6">
        <div className="flex space-x-4 border-b">
          <button
            className={`py-2 px-4 ${activeTab === 'user-growth' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('user-growth')}
          >
            User Growth
          </button>
          <button
            className={`py-2 px-4 ${activeTab === 'skills' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('skills')}
          >
            Popular Skills
          </button>
          <button
            className={`py-2 px-4 ${activeTab === 'transactions' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('transactions')}
          >
            Transactions
          </button>
          <button
            className={`py-2 px-4 ${activeTab === 'revenue' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('revenue')}
          >
            Revenue
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-4 flex space-x-4">
        <div>
          <label>Date From:</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="border px-2 py-1 ml-2"
          />
        </div>
        <div>
          <label>Date To:</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="border px-2 py-1 ml-2"
          />
        </div>
        {activeTab === 'user-growth' && (
          <div>
            <label>Interval:</label>
            <select
              value={interval}
              onChange={(e) => setInterval(e.target.value)}
              className="border px-2 py-1 ml-2"
            >
              <option value="day">Daily</option>
              <option value="week">Weekly</option>
              <option value="month">Monthly</option>
            </select>
          </div>
        )}
        <button
          onClick={() => {
            if (activeTab === 'user-growth') fetchUserGrowthData();
            else if (activeTab === 'skills') fetchSkillsData();
            else if (activeTab === 'transactions') fetchTransactionData();
            else if (activeTab === 'revenue') fetchRevenueData();
          }}
          className="bg-indigo-600 text-white px-4 py-1 rounded"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
        <button
          onClick={() => exportData('csv', activeTab)}
          className="bg-green-600 text-white px-4 py-1 rounded"
          disabled={loading}
        >
          Export CSV
        </button>
        <button
          onClick={() => exportData('pdf', activeTab)}
          className="bg-red-600 text-white px-4 py-1 rounded"
          disabled={loading}
        >
          Export PDF
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2">Loading...</p>
        </div>
      ) : (
        <div>
          {activeTab === 'user-growth' && userGrowthData && (
            <div>
              <div className="bg-white shadow rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">User Growth Over Time</h2>
                <div className="h-80">
                  <Line data={prepareUserGrowthChart()} options={{ maintainAspectRatio: false }} />
                </div>
              </div>

              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Total Users by Role</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {userGrowthData.totalByRole.map(role => (
                    <div key={role._id} className="bg-gray-50 p-4 rounded-lg text-center">
                      <h3 className="text-lg font-medium">{role._id.charAt(0).toUpperCase() + role._id.slice(1)}s</h3>
                      <p className="text-3xl font-bold text-indigo-600">{formatNumber(role.count)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'skills' && skillsData && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white shadow rounded-lg p-6">
                  <h2 className="text-xl font-semibold mb-4">Top Freelancer Skills</h2>
                  <div className="h-80">
                    <Bar
                      data={prepareSkillsChart().freelancerSkills}
                      options={{
                        maintainAspectRatio: false,
                        indexAxis: 'y'
                      }}
                    />
                  </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                  <h2 className="text-xl font-semibold mb-4">Most Requested Skills</h2>
                  <div className="h-80">
                    <Bar
                      data={prepareSkillsChart().projectSkills}
                      options={{
                        maintainAspectRatio: false,
                        indexAxis: 'y'
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Average Hourly Rate by Skill</h2>
                <div className="h-80">
                  <Bar data={prepareSkillsChart().skillRates} options={{ maintainAspectRatio: false }} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'transactions' && transactionData && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white shadow rounded-lg p-6">
                  <h2 className="text-xl font-semibold mb-4">Project Value by Status</h2>
                  <div className="h-80">
                    <Bar data={prepareTransactionChart().statusData} options={{ maintainAspectRatio: false }} />
                  </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                  <h2 className="text-xl font-semibold mb-4">Project Value by Category</h2>
                  <div className="h-80">
                    <Pie data={prepareTransactionChart().categoryData} options={{ maintainAspectRatio: false }} />
                  </div>
                </div>
              </div>

              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Bid vs Budget Analysis</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left">Category</th>
                        <th className="px-4 py-2 text-right">Avg Budget</th>
                        <th className="px-4 py-2 text-right">Avg Bid</th>
                        <th className="px-4 py-2 text-right">Difference</th>
                        <th className="px-4 py-2 text-right">Projects</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactionData.bidVsBudgetAnalysis.map(item => (
                        <tr key={item._id} className="border-t">
                          <td className="px-4 py-2">{item._id}</td>
                          <td className="px-4 py-2 text-right">{formatCurrency(item.avgBudget)}</td>
                          <td className="px-4 py-2 text-right">{formatCurrency(item.avgBidAmount)}</td>
                          <td className="px-4 py-2 text-right">
                            {formatCurrency(item.avgBidAmount - item.avgBudget)}
                            <span className={`ml-2 ${item.avgBidAmount < item.avgBudget ? 'text-green-600' : 'text-red-600'}`}>
                              ({Math.round((item.avgBidAmount / item.avgBudget - 1) * 100)}%)
                            </span>
                          </td>
                          <td className="px-4 py-2 text-right">{item.projectCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'revenue' && revenueData && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white shadow rounded-lg p-6">
                  <h2 className="text-xl font-semibold mb-4">Monthly Revenue</h2>
                  <div className="h-80">
                    <Line data={prepareRevenueChart().monthlyData} options={{ maintainAspectRatio: false }} />
                  </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                  <h2 className="text-xl font-semibold mb-4">Revenue Projection</h2>
                  <div className="h-80">
                    <Doughnut data={prepareRevenueChart().projectionData} options={{ maintainAspectRatio: false }} />
                  </div>
                </div>
              </div>

              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Revenue Summary</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium">Platform Fee</h3>
                    <p className="text-3xl font-bold text-indigo-600">{(revenueData.platformFeePercentage * 100).toFixed(0)}%</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium">Completed Projects Value</h3>
                    <p className="text-3xl font-bold text-green-600">
                      {formatCurrency(revenueData.completedProjectsByMonth.reduce((sum, item) => sum + item.totalValue, 0))}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium">Potential Future Revenue</h3>
                    <p className="text-3xl font-bold text-blue-600">
                      {formatCurrency((revenueData.inProgressProjects.potentialRevenue || 0) + (revenueData.openProjects.potentialRevenue || 0))}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EnhancedAnalyticsDashboard;
