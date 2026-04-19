import React, { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import bidService from '../../services/bidService';
import { StatusBadge, formatDate } from '../../utils/displayHelpers.jsx';
import CounterOfferModal from './CounterOfferModal';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_BASE_URL;

const ProjectBidsManager = ({ projectId }) => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBid, setSelectedBid] = useState(null);

  // Initialize socket once
  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ['websocket'] });

    socket.emit('joinProject', projectId);

    socket.on('new_bid', (bid) => {
      setBids(prev => [bid, ...prev]);
    });
    socket.on('bid_accepted', updateBidInState);
    socket.on('bid_rejected', updateBidInState);
    socket.on('bid_withdrawn', ({ _id }) => {
      setBids(prev => prev.filter(b => b._id !== _id));
    });
    socket.on('counter_offer', updateBidInState);
    socket.on('counter_accepted', updateBidInState);
    socket.on('counter_rejected', updateBidInState);

    return () => {
      socket.emit('leaveProject', projectId);
      socket.disconnect();
    };
  }, [projectId]);

  function updateBidInState(updated) {
    setBids(prev => prev.map(b => b._id === updated._id ? updated : b));
  }

  const fetchBids = useCallback(async () => {
    setError('');
    try {
      const data = await bidService.getBidsForProject(projectId, { sortBy, order });
      setBids(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [projectId, sortBy, order]);

  useEffect(() => {
    setLoading(true);
    fetchBids();
  }, [fetchBids]);

  const openCounter = (bid) => {
    setSelectedBid(bid);
    setModalOpen(true);
  };

  return (
    <div className="mt-8 pt-6 border-t border-gray-200">
      <h2 className="text-2xl font-semibold mb-4">Received Bids ({bids.length})</h2>

      {/* Sorting */}
      <div className="flex gap-4 mb-4">
        <select name="sortBy" value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="createdAt">Date</option>
          <option value="amount">Amount</option>
          <option value="status">Status</option>
        </select>
        <select name="order" value={order} onChange={e => setOrder(e.target.value)}>
          <option value="desc">Desc</option>
          <option value="asc">Asc</option>
        </select>
      </div>

      {loading && <p>Loading bids…</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && bids.length === 0 && <p>No bids yet.</p>}

      <div className="space-y-4">
        {bids.map(bid => (
          <div key={bid._id} className="p-4 border rounded-lg bg-white">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">{bid.freelancerId.name}</p>
                <p className="text-sm text-gray-500">{formatDate(bid.createdAt)}</p>
              </div>
              <StatusBadge status={bid.status} />
            </div>
            <p className="mt-2">{bid.message}</p>
            <div className="mt-3 flex gap-2">
              {(bid.status === 'pending' || bid.status === 'counter_accepted') && (
                <button
                  onClick={() => bidService.updateBid(projectId, bid._id, { status: 'accepted' }).catch(err => alert(err.message))}
                  className="px-3 py-1 bg-green-600 text-white rounded"
                >
                  Accept
                </button>
              )}
              {bid.status === 'pending' && (
                <>
                  <button
                    onClick={() => bidService.updateBid(projectId, bid._id, { status: 'rejected' }).catch(err => alert(err.message))}
                    className="px-3 py-1 bg-red-600 text-white rounded"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => openCounter(bid)}
                    className="px-3 py-1 bg-orange-500 text-white rounded"
                  >
                    Counter
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <CounterOfferModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        bid={selectedBid}
        projectId={projectId}
        onSuccess={() => {
          setModalOpen(false);
          // state will auto-update via socket
        }}
      />
    </div>
  );
};

export default ProjectBidsManager;
