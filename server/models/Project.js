// server/models/Project.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const milestoneSchema = new Schema({
    description: { type: String, required: true },
    dueDate: Date,
    status: { type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending' },
    amount: { type: Number, required: true, min: 0 }, // Payment amount for this milestone
    isPaid: { type: Boolean, default: false },
}, { _id: true }); // Use default _id for milestones

const projectSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Project title is required'],
        trim: true,
    },
    description: {
        type: String,
        required: [true, 'Project description is required'],
        trim: true,
    },
    requirements: { // Can be detailed text or structured requirements
        type: String,
        trim: true,
    },
    category: { // For filtering/search
        type: String,
        required: [true, 'Category is required'],
        trim: true,
        lowercase: true,
        index: true, // Index for faster searching by category
    },
    skillsRequired: [{ // Specific skills needed for the project
        type: String,
        trim: true,
        lowercase: true,
    }],
    budget: { // Could be fixed price or hourly range
        type: Number,
        min: 0,
        // Alternatively: budget: { type: { type: String, enum: ['fixed', 'hourly'] }, amount: Number, minRate: Number, maxRate: Number }
    },
    budgetType: { // Add this new field
        type: String,
        enum: ['fixed', 'hourly'],
        default: 'fixed',
        required: true,
    },
    deadline: {
        type: Date,
        required: [true, 'Deadline is required'],
    },
    status: {
        type: String,
        enum: ['open', 'pending_selection', 'in_progress', 'completed', 'cancelled', 'disputed', 'work_submitted'], // Added 'work_submitted'
        default: 'open',
        index: true,
    },
    clientId: { // User who posted the project
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    freelancerId: { // User who was awarded the project
        type: Schema.Types.ObjectId,
        ref: 'User',
        index: true, // Nullable until assigned
    },
    bids: [{ // List of bids received for this project
        type: Schema.Types.ObjectId,
        ref: 'Bid'
    }],
    milestones: [milestoneSchema], // Project breakdown
    contractId: { // Link to the associated contract
        type: Schema.Types.ObjectId,
        ref: 'Contract'
    },
    // Add fields for project management if needed
    progressPercentage: { type: Number, default: 0, min: 0, max: 100 },
    lastUpdate: Date,

}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);