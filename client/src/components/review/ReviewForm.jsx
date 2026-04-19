// client/src/components/review/ReviewForm.jsx
import React, { useState } from 'react';
import { createReview } from '../../services/reviewService';

const ReviewForm = ({ projectId, freelancerId, onReviewSubmitted }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await createReview({ projectId, freelancerId, rating, comment });
      setRating(5);
      setComment('');
      onReviewSubmitted();
    } catch (err) {
      // Show the real message from the server
      setError(err.response?.data?.message || err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-600">{error}</p>}
      <div>
        <label className="block text-sm font-medium text-gray-700">Rating</label>
        <select
          value={rating}
          onChange={e => setRating(Number(e.target.value))}
          className="mt-1 block w-full border rounded-md"
        >
          {[5,4,3,2,1].map(star => (
            <option key={star} value={star}>{star} Star{star>1&&'s'}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Comment</label>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          rows={4}
          className="mt-1 block w-full border rounded-md"
        />
      </div>
      <button
        type="submit"
        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
      >
        Submit Review
      </button>
    </form>
  );
};

export default ReviewForm;
