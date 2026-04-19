// server/controllers/admin/verificationController.js
const User = require('../../models/User');
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const { getIO } = require('../../utils/socket');
const Notification = require('../../models/Notification');

/**
 * @desc    Get all freelancers with pending verification
 * @route   GET /api/admin/verification/pending
 * @access  Admin
 */
const getPendingVerifications = asyncHandler(async (req, res) => {
  const freelancers = await User.find({
    role: 'freelancer',
    verificationStatus: 'pending'
  })
  .select('name email verificationStatus verificationLevel verificationDocuments createdAt')
  .sort({ createdAt: -1 });

  res.json(freelancers);
});

/**
 * @desc    Get all freelancers by verification status
 * @route   GET /api/admin/verification
 * @access  Admin
 */
const getFreelancersByVerificationStatus = asyncHandler(async (req, res) => {
  const { status } = req.query;
  
  const query = { role: 'freelancer' };
  if (status && status !== 'all') {
    query.verificationStatus = status;
  }
  
  const freelancers = await User.find(query)
    .select('name email verificationStatus verificationLevel verificationDocuments createdAt')
    .sort({ createdAt: -1 });

  res.json(freelancers);
});

/**
 * @desc    Get freelancer details with verification documents
 * @route   GET /api/admin/verification/:freelancerId
 * @access  Admin
 */
const getFreelancerVerificationDetails = asyncHandler(async (req, res) => {
  const { freelancerId } = req.params;
  
  if (!mongoose.Types.ObjectId.isValid(freelancerId)) {
    res.status(400);
    throw new Error('Invalid Freelancer ID');
  }
  
  const freelancer = await User.findById(freelancerId)
    .select('-password -emailVerificationToken -phoneVerificationCode -passwordResetToken');
  
  if (!freelancer) {
    res.status(404);
    throw new Error('Freelancer not found');
  }
  
  if (freelancer.role !== 'freelancer') {
    res.status(400);
    throw new Error('User is not a freelancer');
  }
  
  res.json(freelancer);
});

/**
 * @desc    Update freelancer verification status
 * @route   PUT /api/admin/verification/:freelancerId
 * @access  Admin
 */
const updateVerificationStatus = asyncHandler(async (req, res) => {
  const { freelancerId } = req.params;
  const { verificationStatus, verificationLevel, adminNotes, documentIds } = req.body;
  
  if (!mongoose.Types.ObjectId.isValid(freelancerId)) {
    res.status(400);
    throw new Error('Invalid Freelancer ID');
  }
  
  const freelancer = await User.findById(freelancerId);
  
  if (!freelancer) {
    res.status(404);
    throw new Error('Freelancer not found');
  }
  
  if (freelancer.role !== 'freelancer') {
    res.status(400);
    throw new Error('User is not a freelancer');
  }
  
  // Update verification status if provided
  if (verificationStatus) {
    freelancer.verificationStatus = verificationStatus;
  }
  
  // Update verification level if provided
  if (verificationLevel) {
    freelancer.verificationLevel = verificationLevel;
  }
  
  // Update specific documents if documentIds are provided
  if (documentIds && documentIds.length > 0) {
    documentIds.forEach(docId => {
      const docIndex = freelancer.verificationDocuments.findIndex(
        doc => doc._id.toString() === docId.toString()
      );
      
      if (docIndex !== -1) {
        if (req.body.documentStatus) {
          freelancer.verificationDocuments[docIndex].status = req.body.documentStatus;
        }
        
        if (adminNotes) {
          freelancer.verificationDocuments[docIndex].adminNotes = adminNotes;
        }
      }
    });
  } else if (adminNotes) {
    // If no specific document is targeted, add notes to all pending documents
    freelancer.verificationDocuments.forEach((doc, index) => {
      if (doc.status === 'pending') {
        freelancer.verificationDocuments[index].adminNotes = adminNotes;
      }
    });
  }
  
  const updatedFreelancer = await freelancer.save();
  
  // Create notification for the freelancer
  let notificationType, notificationTitle, notificationMessage;
  
  if (verificationStatus === 'verified') {
    notificationType = 'verification_approved';
    notificationTitle = 'Verification Approved';
    notificationMessage = `Your account has been verified as a ${verificationLevel || freelancer.verificationLevel} freelancer.`;
  } else if (verificationStatus === 'rejected') {
    notificationType = 'verification_rejected';
    notificationTitle = 'Verification Rejected';
    notificationMessage = `Your verification request has been rejected. ${adminNotes || ''}`;
  } else if (verificationStatus === 'needs_revision') {
    notificationType = 'verification_required';
    notificationTitle = 'Verification Needs Revision';
    notificationMessage = `Your verification documents need revision. ${adminNotes || ''}`;
  }
  
  if (notificationType) {
    await Notification.create({
      userId: freelancerId,
      type: notificationType,
      title: notificationTitle,
      message: notificationMessage,
      link: '/freelancer/profile',
      relatedEntity: {
        entityType: 'User',
        entityId: freelancerId
      }
    });
    
    // Emit socket event for real-time notification
    const io = getIO();
    io.to(freelancerId.toString()).emit('notification', {
      type: notificationType,
      title: notificationTitle,
      message: notificationMessage
    });
  }
  
  res.json(updatedFreelancer);
});

module.exports = {
  getPendingVerifications,
  getFreelancersByVerificationStatus,
  getFreelancerVerificationDetails,
  updateVerificationStatus
};
