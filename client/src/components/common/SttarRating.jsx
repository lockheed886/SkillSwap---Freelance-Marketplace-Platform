// client/src/components/common/StarRating.jsx
import React from 'react';

// Error Boundary to catch rendering errors in StarRating
class StarRatingErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(/* error */) {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Error in <StarRating>:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-red-500 text-sm">
          ★ An error occurred rendering the rating ★
        </div>
      );
    }
    return this.props.children;
  }
}

// Pure presentation component
const StarRatingInner = ({ rating = 0 }) => {
  // guard against non‐numbers
  const numeric = typeof rating === 'number' ? rating : parseFloat(rating) || 0;

  const fullStars = Math.floor(numeric);
  const halfStar = numeric % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return (
    <div className="flex items-center">
      {[...Array(fullStars)].map((_, i) => (
        <svg
          key={`full-${i}`}
          className="w-4 h-4 text-yellow-400 fill-current"
          viewBox="0 0 20 20"
        >
          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
        </svg>
      ))}

      {halfStar && (
        <svg
          key="half"
          className="w-4 h-4 text-yellow-400 fill-current"
          viewBox="0 0 20 20"
        >
          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0v15z" />
        </svg>
      )}

      {[...Array(emptyStars)].map((_, i) => (
        <svg
          key={`empty-${i}`}
          className="w-4 h-4 text-gray-300 fill-current"
          viewBox="0 0 20 20"
        >
          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
        </svg>
      ))}

      <span className="ml-1 text-xs text-gray-600">
        ({numeric.toFixed(1)})
      </span>
    </div>
  );
};

// Export the inner component wrapped in the boundary
const StarRating = (props) => (
  <StarRatingErrorBoundary>
    <StarRatingInner {...props} />
  </StarRatingErrorBoundary>
);

export default StarRating;
