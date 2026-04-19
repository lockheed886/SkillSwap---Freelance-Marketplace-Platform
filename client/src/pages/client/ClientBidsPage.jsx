import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import bidService from '../../services/bidService';
import { StatusBadge, formatDate } from '../../utils/displayHelpers.jsx';

const ClientBidsPage = () => {
  const { projectId } = useParams();
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBids = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await bidService.getBidsForProject(projectId);
      setBids(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchBids();
  }, [fetchBids]);

  const handleAction = async (bidId, action) => {
    if (!window.confirm(`Are you sure you want to ${action} this bid?`)) return;
    try {
      await bidService.updateBid(projectId, bidId, { status: action });
      alert(`Bid ${action}ed successfully!`);
      fetchBids();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <p>Loading bids...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Bids for Your Project</h1>
      {bids.length === 0 ? (
        <p className="text-gray-600">No bids have been placed on this project yet.</p>
      ) : (
        <div className="space-y-4">
          {bids.map((bid) => (
            <div key={bid._id} className="p-4 border rounded-lg bg-white">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">{bid.freelancerId.name}</p>
                  <p className="text-sm text-gray-500">{formatDate(bid.createdAt)}</p>
                </div>
                <StatusBadge status={bid.status} />
              </div>
              <p className="mt-2">{bid.message}</p>
              <p className="mt-2 font-semibold">Amount: ${bid.amount.toFixed(2)}</p>
              <div className="mt-3 flex gap-2">
                {bid.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleAction(bid._id, 'accepted')}
                      className="px-3 py-1 bg-green-600 text-white rounded"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleAction(bid._id, 'rejected')}
                      className="px-3 py-1 bg-red-600 text-white rounded"
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientBidsPage;