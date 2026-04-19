// client/src/components/freelancer/BidForm.jsx
import React, { useState } from 'react';
import bidService from '../../services/bidService';

const BidForm = ({ projectId, onBidSubmitted }) => {
    const [amount, setAmount] = useState('');
    const [message, setMessage] = useState('');
    const [estimatedDuration, setEstimatedDuration] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!amount || !message) {
            setError('Please provide both amount and a message.');
            return;
        }
        setLoading(true);
        try {
            const bidData = {
                amount: parseFloat(amount),
                message,
                estimatedDuration,
            };
            const newBid = await bidService.submitBid(projectId, bidData);
            alert('Bid submitted successfully!'); // Replace with better feedback
            setAmount(''); // Clear form
            setMessage('');
            setEstimatedDuration('');
            if (onBidSubmitted) {
                onBidSubmitted(newBid); // Notify parent component if needed
            }
        } catch (err) {
            setError(err.message || 'Failed to submit bid.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 border rounded-lg bg-gray-50 mt-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-700">Place Your Bid</h3>
            {error && <p className="mb-3 text-red-500 text-sm bg-red-100 p-2 rounded">{error}</p>}
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">Bid Amount ($)<span className="text-red-500">*</span></label>
                        <input type="number" id="amount" value={amount} onChange={(e) => setAmount(e.target.value)} min="0" step="any" required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
                    </div>
                     <div>
                        <label htmlFor="estimatedDuration" className="block text-sm font-medium text-gray-700 mb-1">Estimated Duration</label>
                        <input type="text" id="estimatedDuration" value={estimatedDuration} onChange={(e) => setEstimatedDuration(e.target.value)} placeholder="e.g., 2 weeks, 1 month"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
                    </div>
                </div>
                <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Proposal Message <span className="text-red-500">*</span></label>
                    <textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} required rows="4"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
                </div>
                <div className="text-right">
                    <button type="submit" disabled={loading}
                        className={`inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        {loading ? 'Submitting Bid...' : 'Submit Bid'}
                    </button>
                </div>
            </div>
        </form>
    );
};

export default BidForm;