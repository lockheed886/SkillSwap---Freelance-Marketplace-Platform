const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    projectId: { // Project the review is associated with
        type: Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
        index: true,
    },
    reviewerId: { // The user giving the review (usually the client)
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    freelancerId: { // The freelancer being reviewed
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    rating: {
        type: Number,
        required: [true, 'Rating is required'],
        min: 1,
        max: 5,
    },
    comment: { // Review text
        type: String,
        trim: true,
    },
    response: { // Optional response from the freelancer
        type: String,
        trim: true,
    },
    responseAt: Date, // Timestamp for the response

}, { timestamps: true });

// Optional: Ensure a client can only review a freelancer once per project
// reviewSchema.index({ projectId: 1, reviewerId: 1 }, { unique: true });

// Middleware to update freelancer's average rating after a review is saved/updated/deleted
reviewSchema.post('save', async function() {
    await this.constructor.updateFreelancerAverageRating(this.freelancerId);
});

reviewSchema.post('remove', async function() { // If using pre('remove'), `this` refers to the query, not the doc. post is safer here.
    await this.constructor.updateFreelancerAverageRating(this.freelancerId);
});

// Static method to calculate and update average rating
reviewSchema.statics.updateFreelancerAverageRating = async function(freelancerId) {
    const ReviewModel = this; // `this` refers to the Model in a static method
    const UserModel = mongoose.model('User'); // Get User model

    const stats = await ReviewModel.aggregate([
        { $match: { freelancerId: freelancerId } },
        { $group: {
            _id: '$freelancerId',
            averageRating: { $avg: '$rating' }
        }}
    ]);

    try {
        if (stats.length > 0) {
            // Round to one decimal place
            const avgRating = Math.round(stats[0].averageRating * 10) / 10;
            await UserModel.findByIdAndUpdate(freelancerId, { averageRating: avgRating });
        } else {
            // No reviews left, reset average rating
            await UserModel.findByIdAndUpdate(freelancerId, { averageRating: 0 });
        }
    } catch (err) {
        console.error("Error updating average rating:", err);
    }
};


module.exports = mongoose.model('Review', reviewSchema);