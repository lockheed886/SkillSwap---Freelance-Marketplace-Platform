// client/src/pages/admin/VerificationDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import verificationService from '../../services/verificationService';
import { formatDate } from '../../utils/displayHelpers';

const VerificationDetails = () => {
  const { freelancerId } = useParams();
  const navigate = useNavigate();
  
  const [freelancer, setFreelancer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [verificationStatus, setVerificationStatus] = useState('');
  const [verificationLevel, setVerificationLevel] = useState('');
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [documentStatus, setDocumentStatus] = useState('');
  const [updating, setUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  useEffect(() => {
    fetchFreelancerDetails();
  }, [freelancerId]);

  const fetchFreelancerDetails = async () => {
    setLoading(true);
    try {
      const data = await verificationService.getFreelancerVerificationDetails(freelancerId);
      setFreelancer(data);
      setVerificationStatus(data.verificationStatus || '');
      setVerificationLevel(data.verificationLevel || '');
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch freelancer details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentSelect = (docId) => {
    if (selectedDocuments.includes(docId)) {
      setSelectedDocuments(selectedDocuments.filter(id => id !== docId));
    } else {
      setSelectedDocuments([...selectedDocuments, docId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedDocuments.length === freelancer.verificationDocuments.length) {
      setSelectedDocuments([]);
    } else {
      setSelectedDocuments(freelancer.verificationDocuments.map(doc => doc._id));
    }
  };

  const handleUpdateVerification = async () => {
    if (!verificationStatus) {
      setError('Please select a verification status');
      return;
    }

    setUpdating(true);
    setError(null);
    setUpdateSuccess(false);

    try {
      const updateData = {
        verificationStatus,
        adminNotes
      };

      if (verificationLevel) {
        updateData.verificationLevel = verificationLevel;
      }

      if (selectedDocuments.length > 0) {
        updateData.documentIds = selectedDocuments;
        if (documentStatus) {
          updateData.documentStatus = documentStatus;
        }
      }

      await verificationService.updateVerificationStatus(freelancerId, updateData);
      setUpdateSuccess(true);
      fetchFreelancerDetails(); // Refresh data
    } catch (err) {
      setError(err.message || 'Failed to update verification status');
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const getDocumentStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-2">Loading...</p>
      </div>
    );
  }

  if (error && !freelancer) {
    return (
      <div className="p-8">
        <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
          {error}
        </div>
        <button
          onClick={() => navigate('/admin/verification')}
          className="bg-gray-500 text-white px-4 py-2 rounded"
        >
          Back to Verification Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Freelancer Verification Details</h1>
        <button
          onClick={() => navigate('/admin/verification')}
          className="bg-gray-500 text-white px-4 py-2 rounded"
        >
          Back
        </button>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
          {error}
        </div>
      )}

      {updateSuccess && (
        <div className="bg-green-100 text-green-700 p-4 rounded mb-4">
          Verification status updated successfully!
        </div>
      )}

      <div className="bg-white shadow overflow-hidden rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg font-medium text-gray-900">Freelancer Information</h2>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Name</h3>
              <p className="mt-1 text-sm text-gray-900">{freelancer.name}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Email</h3>
              <p className="mt-1 text-sm text-gray-900">{freelancer.email}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Current Verification Status</h3>
              <p className="mt-1 text-sm text-gray-900">{freelancer.verificationStatus?.replace('_', ' ') || 'Not submitted'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Current Verification Level</h3>
              <p className="mt-1 text-sm text-gray-900">{freelancer.verificationLevel || 'Not set'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Skills</h3>
              <div className="mt-1 flex flex-wrap gap-1">
                {freelancer.skills?.length > 0 ? (
                  freelancer.skills.map((skill, index) => (
                    <span key={index} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No skills listed</p>
                )}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Profile Completeness</h3>
              <div className="mt-1 w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${freelancer.profileCompleteness}%` }}
                ></div>
              </div>
              <p className="mt-1 text-xs text-gray-500">{freelancer.profileCompleteness}% complete</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Verification Documents</h2>
          <div className="flex items-center">
            <input 
              type="checkbox" 
              id="selectAll" 
              checked={selectedDocuments.length === freelancer.verificationDocuments?.length}
              onChange={handleSelectAll}
              className="mr-2"
            />
            <label htmlFor="selectAll" className="text-sm text-gray-700">Select All</label>
          </div>
        </div>
        <div className="border-t border-gray-200">
          {freelancer.verificationDocuments?.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {freelancer.verificationDocuments.map((doc) => (
                <li key={doc._id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input 
                        type="checkbox" 
                        checked={selectedDocuments.includes(doc._id)}
                        onChange={() => handleDocumentSelect(doc._id)}
                        className="mr-4"
                      />
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          {doc.documentType.charAt(0).toUpperCase() + doc.documentType.slice(1)} Document
                        </h3>
                        <p className="text-sm text-gray-500">
                          Uploaded: {formatDate(doc.uploadedAt)}
                        </p>
                        {doc.adminNotes && (
                          <p className="text-sm text-gray-500 mt-1">
                            <span className="font-medium">Admin Notes:</span> {doc.adminNotes}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getDocumentStatusBadge(doc.status)}`}>
                        {doc.status}
                      </span>
                      <a 
                        href={doc.documentUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="ml-4 text-indigo-600 hover:text-indigo-900"
                      >
                        View Document
                      </a>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-5 sm:p-6 text-center">
              <p className="text-gray-500">No verification documents submitted</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg font-medium text-gray-900">Update Verification Status</h2>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="verificationStatus" className="block text-sm font-medium text-gray-700">
                Verification Status
              </label>
              <select
                id="verificationStatus"
                value={verificationStatus}
                onChange={(e) => setVerificationStatus(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">Select Status</option>
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
                <option value="needs_revision">Needs Revision</option>
              </select>
            </div>
            <div>
              <label htmlFor="verificationLevel" className="block text-sm font-medium text-gray-700">
                Verification Level
              </label>
              <select
                id="verificationLevel"
                value={verificationLevel}
                onChange={(e) => setVerificationLevel(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">Select Level</option>
                <option value="basic">Basic</option>
                <option value="verified">Verified</option>
                <option value="premium">Premium</option>
              </select>
            </div>
            {selectedDocuments.length > 0 && (
              <div>
                <label htmlFor="documentStatus" className="block text-sm font-medium text-gray-700">
                  Document Status (for selected documents)
                </label>
                <select
                  id="documentStatus"
                  value={documentStatus}
                  onChange={(e) => setDocumentStatus(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">No Change</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            )}
            <div className="md:col-span-2">
              <label htmlFor="adminNotes" className="block text-sm font-medium text-gray-700">
                Admin Notes
              </label>
              <textarea
                id="adminNotes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={4}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Add notes for the freelancer about their verification status..."
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={handleUpdateVerification}
              disabled={updating}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {updating ? 'Updating...' : 'Update Verification'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationDetails;
