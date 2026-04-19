const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const counterOfferSchema = new Schema({
    amount: { type: Number, required: true, min: 0 },
    message: { type: String, trim: true },
    offeredBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Client ID
    offeredAt: { type: Date, default: Date.now }
}, { _id: false });

const bidSchema = new Schema({
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    freelancerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: [true, 'Bid amount is required'], min: 0 },
    message: { type: String, required: [true, 'Proposal message is required'], trim: true },
    estimatedDuration: { type: String, trim: true }, // e.g., "2 weeks"
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'withdrawn', 'counter_offered', 'counter_accepted', 'counter_rejected'],
        default: 'pending',
        index: true,
    },
    counterOffer: counterOfferSchema, // Embedded counter offer from client

}, { timestamps: true });

module.exports = mongoose.model('Bid', bidSchema);