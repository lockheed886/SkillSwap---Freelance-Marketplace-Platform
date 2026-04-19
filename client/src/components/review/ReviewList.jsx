// client/src/components/review/ReviewList.jsx

import React, { useEffect, useState } from 'react';
import { getFreelancerReviews } from '../../services/reviewService';
import StarRating from '../../components/common/SttarRating';

export default function ReviewList({ freelancerId }) {
  const [reviews, setReviews] = useState([]);
  const [filters, setFilters] = useState({ rating: '', order: 'desc' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getFreelancerReviews(freelancerId, filters);
        setReviews(data);
      } catch {
        setReviews([]);
      } finally {
        setLoading(false);
      }
    }
    if (freelancerId) load();
  }, [freelancerId, filters]);

  if (loading) return <p>Loading reviews…</p>;
  if (!reviews.length) return <p>No reviews yet.</p>;

  return (
    <div className="space-y-4">
      <div className="flex gap-4 mb-2">
        <select
          name="rating"
          value={filters.rating}
          onChange={e => setFilters(f => ({ ...f, rating: e.target.value }))}
          className="border rounded"
        >
          <option value="">All</option>
          {[5,4,3,2,1].map(n=>(
            <option key={n} value={n}>{n}★</option>
          ))}
        </select>
        <select
          name="order"
          value={filters.order}
          onChange={e => setFilters(f => ({ ...f, order: e.target.value }))}
          className="border rounded"
        >
          <option value="desc">Newest</option>
          <option value="asc">Oldest</option>
        </select>
      </div>
      <ul className="divide-y divide-gray-200">
        {reviews.map(r => (
          <li key={r._id} className="py-4">
            <div className="flex justify-between">
              <div>
                <h4 className="font-semibold">{r.reviewerId?.name}</h4>
                <StarRating rating={r.rating} />
                <p className="mt-1 text-gray-700">{r.comment}</p>
                {r.response && (
                  <div className="mt-2 pl-4 border-l-2 border-indigo-500">
                    <p className="font-semibold text-indigo-600">Response:</p>
                    <p>{r.response}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(r.responseAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
              <span className="text-xs text-gray-500">
                {new Date(r.createdAt).toLocaleDateString()}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
