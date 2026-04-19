import React, { useState, useEffect, useCallback } from 'react';
import freelancerService from '../../services/freelancerService';
import FreelancerCard from '../../components/freelancer/FreelancerCard';
import { useDebounce } from '../../hooks/useDebounce';

// Placeholder: you should fetch this or get from route/context
const currentProjectId = 'your_project_id_here';

// Placeholder: create or get conversationId for a freelancer
const getConversationIdForFreelancer = async (freelancerId) => {
    // Call your backend to get/create a conversation for the given freelancer and current client
    // For now, return a dummy value
    return `conversation_${freelancerId}`;
};

const FindFreelancerPage = () => {
    const [filters, setFilters] = useState({
        name: '',
        skill: '',
        minRating: '',
        maxRate: '',
    });
    const [sortBy, setSortBy] = useState('createdAt');
    const [order, setOrder] = useState('desc');
    const [freelancers, setFreelancers] = useState([]);
    const [conversationIds, setConversationIds] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const debouncedName = useDebounce(filters.name, 500);

    const fetchFreelancers = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const params = { sortBy, order };
            if (debouncedName) params.name = debouncedName;
            if (filters.skill) params.skill = filters.skill;
            if (filters.minRating) params.minRating = filters.minRating;
            if (filters.maxRate) params.maxRate = filters.maxRate;

            const data = await freelancerService.findFreelancers(params);
            const freelancersList = data.freelancers || [];
            setFreelancers(freelancersList);

            // Fetch or generate conversationId for each freelancer
            const ids = {};
            await Promise.all(freelancersList.map(async (freelancer) => {
                const conversationId = await getConversationIdForFreelancer(freelancer._id);
                ids[freelancer._id] = conversationId;
            }));
            setConversationIds(ids);
        } catch (err) {
            setError(err.message || 'Failed to load freelancers');
            setFreelancers([]);
        } finally {
            setLoading(false);
        }
    }, [filters.skill, filters.minRating, filters.maxRate, debouncedName, sortBy, order]);

    useEffect(() => {
        fetchFreelancers();
    }, [fetchFreelancers]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleSortChange = (e) => {
        const { name, value } = e.target;
        if (name === 'sortBy') setSortBy(value);
        if (name === 'order') setOrder(value);
    };

    const commonSkills = ["React", "Node.js", "JavaScript", "Python", "Django", "Graphic Design", "UI/UX", "Copywriting", "SEO"];

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Find Freelancers</h1>

            {/* Filters */}
            <div className="mb-8 p-4 border rounded-lg bg-gray-50 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={filters.name}
                        onChange={handleFilterChange}
                        placeholder="Search by name..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
                <div>
                    <label htmlFor="skill" className="block text-sm font-medium text-gray-700 mb-1">Skills (comma-sep.)</label>
                    <input
                        type="text"
                        id="skill"
                        name="skill"
                        value={filters.skill}
                        onChange={handleFilterChange}
                        placeholder="e.g., react, nodejs"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
                <div>
                    <label htmlFor="minRating" className="block text-sm font-medium text-gray-700 mb-1">Min. Rating (1-5)</label>
                    <input
                        type="number"
                        id="minRating"
                        name="minRating"
                        min="1" max="5" step="0.5"
                        value={filters.minRating}
                        onChange={handleFilterChange}
                        placeholder="e.g., 4"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
                <div>
                    <label htmlFor="maxRate" className="block text-sm font-medium text-gray-700 mb-1">Max Hourly Rate ($)</label>
                    <input
                        type="number"
                        id="maxRate"
                        name="maxRate"
                        min="0" step="1"
                        value={filters.maxRate}
                        onChange={handleFilterChange}
                        placeholder="e.g., 50"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
                <div className="md:col-span-2 lg:col-span-1">
                    <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                    <select
                        id="sortBy" name="sortBy" value={sortBy} onChange={handleSortChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                        <option value="createdAt">Join Date</option>
                        <option value="averageRating">Rating</option>
                        <option value="name">Name</option>
                        <option value="hourlyRate">Hourly Rate</option>
                    </select>
                </div>
                <div className="lg:col-span-1">
                    <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                    <select
                        id="order" name="order" value={order} onChange={handleSortChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                        <option value="desc">Descending</option>
                        <option value="asc">Ascending</option>
                    </select>
                </div>
            </div>

            {/* Results */}
            <div>
                {loading && <p className="text-center text-gray-500">Loading freelancers...</p>}
                {error && <p className="text-center text-red-500">{error}</p>}
                {!loading && !error && freelancers.length === 0 && (
                    <p className="text-center text-gray-500">No freelancers found matching your criteria.</p>
                )}
                {!loading && !error && freelancers.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {freelancers.map(freelancer => (
                            <FreelancerCard
                                key={freelancer._id}
                                freelancer={freelancer}
                                currentProjectId={currentProjectId}
                                conversationId={conversationIds[freelancer._id]}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FindFreelancerPage;
