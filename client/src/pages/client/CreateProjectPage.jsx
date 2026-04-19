// client/src/pages/client/CreateProjectPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import projectService from '../../services/projectService';
// Optionally import a reusable ProjectForm component later

const CreateProjectPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        requirements: '',
        category: '',
        skillsRequired: '', // Input as comma-separated, convert on submit
        budget: '',
        budgetType: 'fixed', // Added budgetType
        deadline: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { title, description, requirements, category, skillsRequired, budget, budgetType, deadline } = formData;

    const onChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setError('');
    };

    const getMinDate = () => {
        const today = new Date();
        today.setDate(today.getDate() + 1); // Deadline must be at least tomorrow
        return today.toISOString().split('T')[0];
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Basic client-side validation (backend has more)
        if (!title || !description || !category || !deadline) {
            setError('Please fill in Title, Description, Category, and Deadline.');
            return;
        }
        if (new Date(deadline) <= new Date()) {
            setError('Deadline must be in the future.');
            return;
        }

        setLoading(true);
        try {
            const projectData = {
                ...formData,
                budget: formData.budget ? parseFloat(formData.budget) : undefined, // Convert budget
                // Convert comma-separated skills string to array, trim whitespace
                skillsRequired: formData.skillsRequired.split(',').map(skill => skill.trim()).filter(skill => skill !== ''),
            };
            await projectService.createProject(projectData);
            alert('Project created successfully!'); // Replace with better notification
            navigate('/client/dashboard'); // Or navigate to a projects list page
        } catch (err) {
            setError(err.message || 'Failed to create project. Please try again.');
            console.error("Create project error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Post a New Project</h1>

            <form onSubmit={onSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
                {error && <p className="text-red-500 text-sm bg-red-100 p-3 rounded">{error}</p>}

                {/* Title */}
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Project Title <span className="text-red-500">*</span></label>
                    <input type="text" id="title" name="title" value={title} onChange={onChange} required
                           className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
                </div>

                {/* Description */}
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-red-500">*</span></label>
                    <textarea id="description" name="description" value={description} onChange={onChange} required rows="4"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
                </div>

                {/* Requirements */}
                <div>
                    <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-1">Requirements / Scope</label>
                    <textarea id="requirements" name="requirements" value={requirements} onChange={onChange} rows="3"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
                </div>

                {/* Category */}
                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category <span className="text-red-500">*</span></label>
                    {/* Consider using a select dropdown for predefined categories */}
                    <input type="text" id="category" name="category" value={category} onChange={onChange} required placeholder="e.g., Web Development, Graphic Design"
                           className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
                </div>

                {/* Skills Required */}
                <div>
                    <label htmlFor="skillsRequired" className="block text-sm font-medium text-gray-700 mb-1">Skills Required (comma-separated)</label>
                    <input type="text" id="skillsRequired" name="skillsRequired" value={skillsRequired} onChange={onChange} placeholder="e.g., react, nodejs, css"
                           className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
                </div>

                {/* Budget & Deadline (Side-by-side) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-1">Budget ($) (Optional)</label>
                        <input type="number" id="budget" name="budget" value={budget} onChange={onChange} min="0" step="any"
                               className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
                    </div>

                    {/* Budget Type */}
                    <div>
                        <label htmlFor="budgetType" className="block text-sm font-medium text-gray-700 mb-1">Budget Type <span className="text-red-500">*</span></label>
                        <select id="budgetType" name="budgetType" value={budgetType} onChange={onChange} required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                            <option value="fixed">Fixed Price</option>
                            <option value="hourly">Hourly</option>
                        </select>
                    </div>

                    {/* Deadline */}
                    <div>
                        <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-1">Deadline <span className="text-red-500">*</span></label>
                        <input type="date" id="deadline" name="deadline" value={deadline} onChange={onChange} required
                               min={getMinDate()} // Prevent selecting past dates
                               className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="text-right">
                    <button type="submit" disabled={loading}
                            className={`inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        {loading ? 'Posting Project...' : 'Post Project'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateProjectPage;