import React from 'react';
import { Link } from 'react-router-dom';

const StarRating = ({ rating }) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    return (
        <div className="flex items-center">
            {[...Array(fullStars)].map((_, i) => (
                <svg key={`full-${i}`} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" /></svg>
            ))}
            {halfStar && (
                <svg key="half" className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0v15z" /></svg>
            )}
            {[...Array(emptyStars)].map((_, i) => (
                <svg key={`empty-${i}`} className="w-4 h-4 text-gray-300 fill-current" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" /></svg>
            ))}
            <span className="ml-1 text-xs text-gray-600">({rating.toFixed(1)})</span>
        </div>
    );
};

const FreelancerCard = ({ freelancer, currentProjectId, conversationId }) => {
    if (!freelancer) return null;

    const displayedSkills = freelancer.skills?.slice(0, 4) || [];

    return (
      <div className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white p-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center mb-3">
          <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3 font-semibold">
            {freelancer.name?.charAt(0).toUpperCase() || 'F'}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{freelancer.name}</h3>
            {freelancer.averageRating > 0 && <StarRating rating={freelancer.averageRating} />}
            {freelancer.hourlyRate && (
              <p className="text-sm text-gray-500 mt-1">
                ${freelancer.hourlyRate.toFixed(2)} / hr
              </p>
            )}
          </div>
        </div>

        {/* Bio */}
        {freelancer.bio && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-3 flex-grow">
            {freelancer.bio}
          </p>
        )}

        {/* Skills */}
        {displayedSkills.length > 0 && (
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Top Skills</h4>
            <div className="flex flex-wrap gap-1">
              {displayedSkills.map((skill, i) => (
                <span
                  key={i}
                  className="bg-gray-100 text-gray-700 text-xs font-medium px-2 py-0.5 rounded"
                >
                  {skill}
                </span>
              ))}
              {freelancer.skills.length > 4 && (
                <span className="text-gray-500 text-xs font-medium px-2 py-0.5 rounded">
                  +{freelancer.skills.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-auto pt-3 border-t border-gray-100 space-y-2">
          {/* Message */}
          {conversationId && (
            <Link
              to={`/chat/${conversationId}`}
              className="block w-full text-center bg-green-500 hover:bg-green-600 text-white text-sm font-medium py-2 rounded transition"
              style={{ color: 'white', textDecoration: 'none' }}
            >
              Message
            </Link>
          )}

          {/* Place a Bid */}
          {currentProjectId && (
            <Link
              to={`/freelancer/project/${currentProjectId}/bid`}
              className="block w-full text-center bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium py-2 rounded transition"
              style={{ color: 'white', textDecoration: 'none' }}
            >
              Place a Bid
            </Link>
          )}
        </div>
      </div>
    );
  };

  export default FreelancerCard;
