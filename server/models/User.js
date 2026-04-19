const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt'); // Import bcrypt here or in your auth controller

const portfolioItemSchema = new Schema({
    title: { type: String, required: true },
    description: String,
    url: String, // Link to live project or repository
    imageUrl: String,
    category: String, // e.g., 'Web Development', 'Graphic Design'
}, { _id: false }); // _id: false prevents Mongoose from creating ObjectIds for subdocuments

const verificationDocumentSchema = new Schema({
    documentUrl: { type: String, required: true }, // URL to the stored document (e.g., S3 link)
    documentType: { type: String, enum: ['id', 'certificate', 'other'], required: true },
    uploadedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    adminNotes: String, // Optional notes from admin during verification
}, { _id: false });

const userSchema = new Schema({
    name: { type: String, required: [true, 'Name is required'], trim: true },
    email: { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true, match: [/\S+@\S+\.\S+/, 'is invalid'], index: true },
    phoneNumber: { type: String, trim: true },
    password: { type: String, required: [true, 'Password is required'], minlength: [6, 'Password must be at least 6 characters long'] },
    role: { type: String, required: true, enum: ['client', 'freelancer', 'admin'], default: 'client' },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    isPhoneVerified: { type: Boolean, default: false },
    phoneVerificationCode: String,
    phoneVerificationExpires: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    // Client Specific
    companyName: { type: String, trim: true },
    projectsPosted: [{ type: Schema.Types.ObjectId, ref: 'Project' }],
    // Freelancer Specific
    bio: String,
    skills: [{ type: String, trim: true, lowercase: true }],
    portfolio: [portfolioItemSchema],
    hourlyRate: { type: Number, min: 0 },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    reviewsReceived: [{ type: Schema.Types.ObjectId, ref: 'Review' }],
    bidsPlaced: [{ type: Schema.Types.ObjectId, ref: 'Bid' }],
    verificationStatus: { type: String, enum: ['not_submitted', 'pending', 'verified', 'rejected', 'needs_revision'], default: 'not_submitted' },
    verificationLevel: { type: String, enum: ['basic', 'verified', 'premium'] },
    verificationDocuments: [verificationDocumentSchema],
    profileCompleteness: { type: Number, default: 0, min: 0, max: 100 },
    isActive: { type: Boolean, default: true },
    // Notification preferences
    notificationPreferences: {
        email: {
            projectUpdates: { type: Boolean, default: true },
            bidUpdates: { type: Boolean, default: true },
            messages: { type: Boolean, default: true },
            platformAnnouncements: { type: Boolean, default: true }
        },
        inApp: {
            projectUpdates: { type: Boolean, default: true },
            bidUpdates: { type: Boolean, default: true },
            messages: { type: Boolean, default: true },
            platformAnnouncements: { type: Boolean, default: true }
        },
        sms: {
            projectUpdates: { type: Boolean, default: false },
            bidUpdates: { type: Boolean, default: false },
            messages: { type: Boolean, default: false },
            platformAnnouncements: { type: Boolean, default: false }
        }
    },
}, { timestamps: true });

// Password Hashing Middleware
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10');
        this.password = await bcrypt.hash(this.password, saltRounds);
        next();
    } catch (error) {
        next(error);
    }
});

// Password Comparison Method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};


module.exports = mongoose.model('User', userSchema);