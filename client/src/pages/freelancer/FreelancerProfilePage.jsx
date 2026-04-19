import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import userService from '../../services/userService';
import ReviewList from '../../components/review/ReviewList';
import StarRating from '../../components/common/StarRating';

const FreelancerProfilePage = () => {
  const { id } = useParams(); // Freelancer ID from route param
  const [freelancer, setFreelancer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFreelancer = async () => {
      try {
        const data = await userService.getUserById(id);
        setFreelancer(data);
      } catch (error) {
        console.error('Failed to fetch freelancer:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFreelancer();
  }, [id]);

  if (loading) return <p className="text-center text-gray-500">Loading profile...</p>;
  if (!freelancer) return <p className="text-center text-red-500">Freelancer not found.</p>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">{freelancer.name}</h1>
        <p className="text-gray-600">{freelancer.bio}</p>
        <div className="mt-2">
          <StarRating rating={freelancer.averageRating || 0} />
          <p className="text-sm text-gray-500">Average Rating: {freelancer.averageRating || 'N/A'}</p>
        </div>
      </div>

      {/* Reviews Section */}
      <section className="mt-10">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Client Reviews</h2>
        <ReviewList freelancerId={freelancer._id} />
      </section>
    </div>
  );
};

export default FreelancerProfilePage;
