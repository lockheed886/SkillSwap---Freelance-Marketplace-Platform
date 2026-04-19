const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// const crypto = require('crypto'); // Use for SHA-256 hashing

const contractVersionSchema = new Schema({
    terms: { type: String, required: true },
    versionHash: { type: String, required: true }, // SHA-256 hash of this version's terms
    createdAt: { type: Date, default: Date.now }
}, { _id: false });

const signatureSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    signatureHash: { type: String, required: true }, // Represents digital agreement (could be hash of user details + terms hash + timestamp)
    signedAt: { type: Date, default: Date.now }
}, { _id: false });

const contractSchema = new Schema({
    projectId: {
        type: Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
        unique: true, // Typically one contract per project
        index: true,
    },
    clientId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    freelancerId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    terms: { // The current/active terms of the contract
        type: String,
        required: [true, 'Contract terms are required'],
        trim: true,
    },
    status: {
        type: String,
        enum: ['draft', 'pending_signatures', 'active', 'completed', 'disputed', 'terminated'],
        default: 'draft',
        index: true,
    },
    signatures: [signatureSchema], // Store signatures from both parties
    // contractHash: { // SHA-256 hash of key contract elements (e.g., terms, parties, projectId) for integrity
    //     type: String,
    //     required: true,
    //     // Hash generation logic needed before saving
    // },
    versions: [contractVersionSchema], // History of contract term changes

}, { timestamps: true });

// Pre-save hook to generate/update contractHash and add initial version (conceptual)
// contractSchema.pre('save', function(next) {
//   if (this.isModified('terms') || this.isNew) {
//     const currentTerms = this.terms;
//     // Generate SHA-256 hash for the terms
//     const termsHash = crypto.createHash('sha256').update(currentTerms).digest('hex');

//     // Generate overall contract hash (example)
//     const contractDataString = `${this.projectId}-${this.clientId}-${this.freelancerId}-${termsHash}`;
//     this.contractHash = crypto.createHash('sha256').update(contractDataString).digest('hex');

//     // Add to versions if terms changed
//     if (this.isModified('terms')) {
//       this.versions.push({ terms: currentTerms, versionHash: termsHash, createdAt: new Date() });
//     } else if (this.isNew) {
//         // Add initial version when creating contract
//         this.versions.push({ terms: currentTerms, versionHash: termsHash, createdAt: new Date() });
//     }
//   }
//   next();
// });

// Method to check if both parties have signed the latest version
contractSchema.methods.areSignaturesComplete = function() {
    const clientSigned = this.signatures.some(sig => sig.userId.equals(this.clientId));
    const freelancerSigned = this.signatures.some(sig => sig.userId.equals(this.freelancerId));
    return clientSigned && freelancerSigned;
};

module.exports = mongoose.model('Contract', contractSchema);