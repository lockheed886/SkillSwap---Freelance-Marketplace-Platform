// client/src/components/client/CounterOfferModal.jsx

import React, { useState, useEffect } from 'react';
import bidService from '../../services/bidService';

export default function CounterOfferModal({
  isOpen,
  onClose,
  bid,
  projectId,
  onSuccess
}) {
  // Don’t render anything if modal is closed or no bid selected
  if (!isOpen || !bid) return null;

  const [amount, setAmount] = useState(bid.counterOffer?.amount || '');
  const [message, setMessage] = useState(bid.counterOffer?.message || '');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Reset fields whenever a new bid is selected
  useEffect(() => {
    setAmount(bid.counterOffer?.amount ?? '');
    setMessage(bid.counterOffer?.message ?? '');
    setError('');
  }, [bid]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (amount === '' || message.trim() === '') {
      setError('Both amount and message are required.');
      return;
    }

    setSubmitting(true);
    try {
      await bidService.updateBid(projectId, bid._id, {
        counterOfferAmount: parseFloat(amount),
        counterOfferMessage: message.trim()
      });
      onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to send counter-offer');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-lg">
        <h3 className="text-xl font-semibold mb-4">Counter Offer</h3>
        {error && <p className="text-red-600 mb-2">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="counter-amount" className="block text-sm font-medium text-gray-700">
              Amount ($)
            </label>
            <input
              id="counter-amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="0.01"
              disabled={submitting}
              className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="counter-message" className="block text-sm font-medium text-gray-700">
              Message
            </label>
            <textarea
              id="counter-message"
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={submitting}
              className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
            >
              {submitting ? 'Sending…' : 'Send Counter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
