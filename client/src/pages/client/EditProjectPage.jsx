// client/src/pages/client/EditProjectPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import projectService from '../../services/projectService';
import ProjectBidsManager from '../../components/client/ProjectBidsManager';
import { StatusBadge } from '../../utils/displayHelpers';  // ← Added import

const EditProjectPage = () => {
    const { id: projectId } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        requirements: '',
        category: '',
        skillsRequired: '',
        budget: '',
        budgetType: 'fixed', // Added budgetType
        deadline: '',
        status: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [isEditable, setIsEditable] = useState(false);

    const fetchProject = useCallback(async () => {
        setError('');
        try {
            let data = await projectService.getProjectById(projectId);

            // Unwrap BOM key if it sneaks in
            const bomKey = Object.keys(data).find(k => k.charCodeAt(0) === 0xFEFF);
            if (bomKey) data = data[bomKey];

            console.log("Fetched Project Data:", data);

            setFormData({
                title: data.title || '',
                description: data.description || '',
                requirements: data.requirements || '',
                category: data.category || '',
                skillsRequired: (data.skillsRequired || []).join(', '),
                budget: data.budget != null ? data.budget.toString() : '',
                budgetType: data.budgetType || 'fixed', // Added budgetType
                deadline: data.deadline
                    ? new Date(data.deadline).toISOString().split('T')[0]
                    : '',
                status: data.status || '',
            });
            setIsEditable(data.status === 'open');
        } catch (err) {
            console.error("Failed to load project data:", err);
            setError(err.message || 'Failed to load project data.');
            // Optionally redirect on 404/403
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        fetchProject();
    }, [fetchProject]);

    const onChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
        // Clear general page error on any form interaction if it was previously set
        if (error) setError('');
    };

    const getMinDate = () => {
        const today = new Date();
        today.setDate(today.getDate() + 1);
        return today.toISOString().split('T')[0];
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!isEditable) {
            setError('Project cannot be edited because its status is not \'open\'.');
            return;
        }

        // Basic client-side validation
        if (!formData.title || !formData.description || !formData.category || !formData.deadline) {
            setError('Please fill in Title, Description, Category, and Deadline.');
            return;
        }
        if (new Date(formData.deadline) <= new Date()) {
            setError('Deadline must be in the future.');
            return;
        }

        setSubmitting(true);
        try {
            const projectDataToUpdate = {
                title: formData.title,
                description: formData.description,
                requirements: formData.requirements,
                category: formData.category,
                budget: formData.budget !== '' ? parseFloat(formData.budget) : undefined,
                budgetType: formData.budgetType, // Added budgetType
                deadline: formData.deadline,
                skillsRequired: formData.skillsRequired
                    .split(',')
                    .map(s => s.trim())
                    .filter(s => s),
            };

            console.log("Submitting Project Data:", projectDataToUpdate);

            await projectService.updateProject(projectId, projectDataToUpdate);
            alert('Project updated successfully!');
            navigate('/client/my-projects');
        } catch (err) {
            console.error("Update project error:", err);
            setError(err.message || 'Failed to update project. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <p>Loading project details...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Edit Project</h1>

            {error && (
                <div className="mb-4">
                    <p className="text-red-600 text-center bg-red-100 p-4 rounded">{error}</p>
                </div>
            )}
            {!isEditable && formData.status && (
                <div className="mb-4 p-4 bg-yellow-100 text-yellow-700 rounded-md">
                    <p className="font-semibold">This project is currently in '{formData.status.replace('_', ' ')}' status and cannot be edited.</p>
                    <p>Only projects with 'open' status can be modified.</p>
                </div>
            )}

            <form onSubmit={onSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow mb-8">
                {/* Title */}
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                        Project Title <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={onChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        disabled={submitting || !isEditable}
                    />
                </div>

                {/* Description */}
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                        Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={onChange}
                        rows="4"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        disabled={submitting || !isEditable}
                    />
                </div>

                {/* Requirements */}
                <div>
                    <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-1">
                        Requirements / Scope
                    </label>
                    <textarea
                        id="requirements"
                        name="requirements"
                        value={formData.requirements}
                        onChange={onChange}
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        disabled={submitting || !isEditable}
                    />
                </div>

                {/* Category */}
                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                        Category <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={onChange}
                        required
                        placeholder="e.g., Web Development"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        disabled={submitting || !isEditable}
                    />
                </div>

                {/* Skills */}
                <div>
                    <label htmlFor="skillsRequired" className="block text-sm font-medium text-gray-700 mb-1">
                        Skills Required (comma-separated)
                    </label>
                    <input
                        type="text"
                        id="skillsRequired"
                        name="skillsRequired"
                        value={formData.skillsRequired}
                        onChange={onChange}
                        placeholder="e.g., react, nodejs"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        disabled={submitting || !isEditable}
                    />
                </div>

                {/* Budget & Deadline */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-1">
                            Budget ($) (Optional)
                        </label>
                        <input
                            type="number"
                            id="budget"
                            name="budget"
                            value={formData.budget}
                            onChange={onChange}
                            min="0"
                            step="any"
                            placeholder="e.g., 500"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            disabled={submitting || !isEditable}
                        />
                    </div>
                    <div>
                        <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-1">
                            Deadline <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            id="deadline"
                            name="deadline"
                            value={formData.deadline}
                            onChange={onChange}
                            required
                            min={getMinDate()}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            disabled={submitting || !isEditable}
                        />
                    </div>
                </div>

                {/* Budget Type */}
                <div className="mb-4">
                    <label htmlFor="budgetType" className="block text-sm font-medium text-gray-700 mb-1">
                        Budget Type <span className="text-red-500">*</span>
                    </label>
                    <select
                        id="budgetType"
                        name="budgetType"
                        value={formData.budgetType}
                        onChange={onChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        disabled={submitting || !isEditable}
                    >
                        <option value="fixed">Fixed Price</option>
                        <option value="hourly">Hourly</option>
                    </select>
                </div>

                {/* Status Badge */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Current Status
                    </label>
                    <StatusBadge status={formData.status} />
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={() => navigate('/client/my-projects')}
                        disabled={submitting}
                        className="py-2 px-4 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={submitting || !isEditable}
                        className={`py-2 px-6 rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 ${ (submitting || !isEditable) ? 'cursor-not-allowed' : ''}`}
                    >
                        {submitting ? 'Saving Changes...' : 'Save Changes'}
                    </button>
                </div>
            </form>

            {/* Bids Manager */}
            {formData.title && isEditable && (
                <ProjectBidsManager projectId={projectId} />
            )}
        </div>
    );
};

export default EditProjectPage;
