const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// const crypto = require('crypto'); // Use for SHA-256 if implementing metadata hashing

const messageSchema = new Schema({
    conversationId: { // Group messages between two users, possibly related to a project
        type: String, // Could be combination of user IDs or a dedicated ID
        required: true,
        index: true,
    },
    senderId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    receiverId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    projectId: { // Optional: link message to a specific project context
        type: Schema.Types.ObjectId,
        ref: 'Project',
        index: true,
    },
    content: { // The actual message text
        type: String,
        required: true,
        trim: true,
    },
    readStatus: { // Whether the receiver has read the message
        type: Boolean,
        default: false,
    },
    // metadataHash: { // Field for SHA-256 hash of sensitive metadata (if applicable)
    //     type: String,
    //     // Hashing logic would be applied before saving
    // },

}, { timestamps: true }); // Includes createdAt (timestamp) and updatedAt

// Pre-save hook example for metadata hashing (conceptual)
// messageSchema.pre('save', function(next) {
//   if (this.isNew || this.isModified('senderId') || this.isModified('receiverId') || this.isModified('createdAt')) {
//     // Define what constitutes the metadata to be hashed
//     const metadataString = `${this.senderId}-${this.receiverId}-${this.createdAt.toISOString()}`;
//     this.metadataHash = crypto.createHash('sha256').update(metadataString).digest('hex');
//   }
//   next();
// });

module.exports = mongoose.model('Message', messageSchema);