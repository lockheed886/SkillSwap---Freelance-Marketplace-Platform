// client/src/pages/admin/VerificationDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import verificationService from '../../services/verificationService';
import { formatDate } from '../../utils/displayHelpers';

const VerificationDashboard = () => {
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('pending');

  useEffect(() => {
    fetchFreelancers();
  }, [statusFilter]);

  const fetchFreelancers = async () => {
    setLoading(true);
    try {
      let data;
      if (statusFilter === 'pending') {
        data = await verificationService.getPendingVerifications();
      } else {
        data = await verificationService.getFreelancersByVerificationStatus(statusFilter);
      }
      setFreelancers(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch freelancers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'needs_revision':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelBadgeClass = (level) => {
    switch (level) {
      case 'basic':
        return 'bg-blue-100 text-blue-800';
      case 'verified':
        return 'bg-indigo-100 text-indigo-800';
      case 'premium':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Freelancer Verification</h1>
        <div className="flex space-x-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
            <option value="needs_revision">Needs Revision</option>
            <option value="all">All</option>
          </select>
          <button
            onClick={fetchFreelancers}
            className="bg-indigo-600 text-white px-4 py-2 rounded"
          >
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2">Loading...</p>
        </div>
      ) : freelancers.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded">
          <p className="text-gray-500">No freelancers found with the selected status.</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Documents
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {freelancers.map((freelancer) => (
                <tr key={freelancer._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {freelancer.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{freelancer.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(freelancer.verificationStatus)}`}>
                      {freelancer.verificationStatus?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {freelancer.verificationLevel ? (
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getLevelBadgeClass(freelancer.verificationLevel)}`}>
                        {freelancer.verificationLevel}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">Not set</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {freelancer.verificationDocuments?.length || 0} documents
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {formatDate(freelancer.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link
                      to={`/admin/verification/${freelancer._id}`}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Review
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default VerificationDashboard;
