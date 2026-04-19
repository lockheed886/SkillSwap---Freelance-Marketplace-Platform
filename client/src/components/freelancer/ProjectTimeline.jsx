// client/src/components/freelancer/ProjectTimeline.jsx
import React, { useState, useEffect } from 'react';
import projectService from '../../services/projectService'; // Assuming you have this service
import { formatDate } from '../../utils/displayHelpers';

const ProjectTimeline = ({ project, onUpdateMilestone }) => {
    const [milestones, setMilestones] = useState(project.milestones || []);
    const [progress, setProgress] = useState(0); // Overall project progress (0-100)
    // Time tracking state (example, adapt as needed)
    const [timeEntries, setTimeEntries] = useState([]);
    const [newTimeLog, setNewTimeLog] = useState({ hours: '', description: '' });

    useEffect(() => {
        const currentMilestones = project.milestones || [];
        setMilestones(currentMilestones);

        if (project.status === 'completed') {
            setProgress(100); // If project is completed, progress is 100%
        } else {
            const completedMilestones = currentMilestones.filter(m => m.status === 'completed').length;
            const totalMilestones = currentMilestones.length;
            setProgress(totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0);
        }
    }, [project.milestones, project.status]); // Added project.status to dependency array

    const handleMilestoneStatusChange = async (milestoneId, newStatus) => {
        try {
            // Call the service to update the milestone status on the backend
            await projectService.updateMilestoneStatus(project._id, milestoneId, { status: newStatus });

            // Optimistically update local state for immediate UI feedback
            const updatedMilestones = milestones.map(m =>
                m._id === milestoneId ? { ...m, status: newStatus } : m
            );
            setMilestones(updatedMilestones);

            // Recalculate progress based on the optimistic update
            const completedCount = updatedMilestones.filter(m => m.status === 'completed').length;
            const totalUpdatedMilestones = updatedMilestones.length;
            setProgress(totalUpdatedMilestones > 0 ? Math.round((completedCount / totalUpdatedMilestones) * 100) : 0);

            // Notify the parent component that an update occurred.
            // The parent is expected to refetch the project data, which will then flow down
            // and cause this component's useEffect to sync with the authoritative data.
            if (onUpdateMilestone) {
                onUpdateMilestone(project._id, milestoneId, newStatus);
            }

        } catch (error) {
            console.error("Error updating milestone status:", error);
            alert(`Failed to update milestone status: ${error.message}. The UI may not reflect the true state.`);
            // Consider reverting optimistic updates here or triggering a direct refetch
        }
    };

    const handleLogTime = (e) => {
        e.preventDefault();
        if (!newTimeLog.hours || isNaN(parseFloat(newTimeLog.hours))) {
            alert("Please enter valid hours.");
            return;
        }
        setTimeEntries([...timeEntries, { ...newTimeLog, date: new Date(), hours: parseFloat(newTimeLog.hours) }]);
        setNewTimeLog({ hours: '', description: '' });
        // Here you would typically also save this to your backend
        // e.g., await projectService.logTime(project._id, newTimeLog);
        alert("Time logged (locally for now).");
    };
    
    const totalLoggedHours = timeEntries.reduce((sum, entry) => sum + entry.hours, 0);

    // Deadline tracking
    const timeToDeadline = project.deadline ? new Date(project.deadline).getTime() - new Date().getTime() : null;
    const daysToDeadline = timeToDeadline ? Math.ceil(timeToDeadline / (1000 * 60 * 60 * 24)) : null;
    
    let deadlineColor = "text-gray-700";
    if (daysToDeadline !== null) {
        if (daysToDeadline < 0) deadlineColor = "text-red-600 font-semibold"; // Past due
        else if (daysToDeadline <= 7) deadlineColor = "text-orange-500"; // Nearing
    }

    return (
        <div className="bg-white shadow-md rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-3 text-gray-800">Project Timeline & Progress</h3>

            {/* Overall Progress Bar - Conditionally render if milestones exist */}
            {project.milestones && project.milestones.length > 0 && (
                <div className="mb-4">
                    <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-indigo-700">Overall Progress</span>
                        <span className="text-sm font-medium text-indigo-700">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
            )}

            {/* Deadline */}
            {project.deadline && (
                <div className="mb-4">
                    <p className={`text-sm ${deadlineColor}`}>
                        <strong>Deadline:</strong> {formatDate(project.deadline)}
                        {daysToDeadline !== null &&
                            (daysToDeadline < 0
                                ? ` (Past due by ${Math.abs(daysToDeadline)} days)`
                                : ` (${daysToDeadline} days remaining)`) }
                    </p>
                    {daysToDeadline !== null && daysToDeadline > 0 && daysToDeadline <= 7 && (
                        <p className="text-xs text-orange-600">Reminder: Deadline is approaching soon!</p>
                    )}
                </div>
            )}

            {/* Milestones */}
            <div className="mb-6"> {/* Wrapper for Milestones section */}
                <h4 className="text-md font-semibold mb-2 text-gray-700">Milestones</h4>
                {milestones && milestones.length > 0 ? (
                    <ul className="space-y-3">
                        {milestones.map((milestone) => (
                            <li key={milestone._id || milestone.description} className="p-3 bg-gray-50 rounded-md border">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-medium text-gray-800">{milestone.description}</p>
                                        {milestone.dueDate && <p className="text-xs text-gray-500">Due: {formatDate(milestone.dueDate)}</p>}
                                        {milestone.amount !== undefined && <p className="text-xs text-gray-500">Amount: ${milestone.amount.toFixed(2)}</p>}
                                    </div>
                                    <select
                                        value={milestone.status}
                                        onChange={(e) => handleMilestoneStatusChange(milestone._id, e.target.value)}
                                        className="text-xs p-1 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                        disabled={project.status !== 'in_progress' || milestone.isPaid}
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                </div>
                                {/* Status messages */}
                                {milestone.isPaid ? (
                                    <p className="text-xs text-blue-600 mt-1">Milestone Paid.</p>
                                ) : milestone.status === 'completed' ? (
                                    <p className="text-xs text-green-600 mt-1">Milestone marked as completed.</p>
                                ) : null}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-gray-500">No milestones defined for this project yet.</p>
                )}
            </div>

            {/* Time Tracking (Example - adapt for hourly projects) */}
            {project.budgetType === 'hourly' && ( // Assuming project model has budgetType
                <div className="mb-6">
                    <h4 className="text-md font-semibold mb-2 text-gray-700">Time Tracking</h4>
                    <form onSubmit={handleLogTime} className="flex gap-2 mb-3 items-end">
                        <input 
                            type="number" 
                            placeholder="Hours" 
                            value={newTimeLog.hours}
                            onChange={e => setNewTimeLog({...newTimeLog, hours: e.target.value})}
                            className="p-1 border rounded-md text-sm w-20"
                            step="0.1"
                            min="0.1"
                        />
                        <input 
                            type="text" 
                            placeholder="Description (optional)"
                            value={newTimeLog.description}
                            onChange={e => setNewTimeLog({...newTimeLog, description: e.target.value})}
                            className="p-1 border rounded-md text-sm flex-grow"
                        />
                        <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600">Log Time</button>
                    </form>
                    {timeEntries.length > 0 && (
                        <ul className="space-y-1 text-xs text-gray-600">
                            {timeEntries.map((entry, idx) => (
                                <li key={idx} className="flex justify-between">
                                    <span>{formatDate(entry.date)} - {entry.hours} hrs</span>
                                    <span>{entry.description}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                    <p className="text-sm font-medium mt-2">Total Logged: {totalLoggedHours.toFixed(1)} hours</p>
                </div>
            )}
        </div>
    );
};

export default ProjectTimeline;
