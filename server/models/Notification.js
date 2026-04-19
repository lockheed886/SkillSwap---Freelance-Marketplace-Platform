// server/models/Notification.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate-v2');

const notificationSchema = new Schema({
    userId: { // The recipient of the notification
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    type: {
        type: String,
        required: true,
        enum: [
            // Project related
            'project_posted', // To relevant freelancers? (Potentially many notifications)
            'project_updated',
            'project_cancelled',
            'project_completed',
            'milestone_reached',
            'milestone_approved',
            // Bid related
            'new_bid_received', // To client
            'bid_accepted', // To freelancer
            'bid_rejected', // To freelancer
            'counter_offer_received', // To freelancer
            'counter_offer_responded', // To client
            // Message related
            'new_message',
            // Review related
            'review_received', // To freelancer
            'review_responded', // To client
            // Verification related
            'verification_approved', // To freelancer
            'verification_rejected', // To freelancer
            'verification_required', // To freelancer
            // Contract related
            'contract_generated',
            'contract_signed',
            'contract_disputed',
            // Admin/Platform related
            'platform_announcement',
            'account_suspended',
            'account_activated',
            // Auth related
            'password_reset_request', // Link might be in email/sms, but notify in-app too
            'email_verified',
            'phone_verified',
            // Other
            'dispute_update',
            'payment_processed',
            'payment_failed',
        ],
    },
    title: { // A short title for the notification list
        type: String,
        required: true,
        trim: true,
    },
    message: { // The detailed notification message
        type: String,
        required: true,
        trim: true,
    },
    link: { // Optional: A URL/path to navigate to within the app
        type: String,
        trim: true,
    },
    isRead: {
        type: Boolean,
        default: false,
        index: true, // Index for easily querying unread notifications
    },
    relatedEntity: { // Optional: Reference to the related item (Project, Bid, User, etc.)
        entityType: { type: String, enum: ['Project', 'Bid', 'User', 'Review', 'Contract', 'Message'] },
        entityId: { type: Schema.Types.ObjectId }
    }

}, { timestamps: true }); // Includes createdAt

// Add pagination plugin
notificationSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Notification', notificationSchema);