const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const MarriageApplication = require('../models/MarriageApplication');
const User = require('../models/User');
const Notification = require('../models/Notification');
const NotificationService = require('../services/notificationService');
const { auth, authorize } = require('../middleware/auth-simple');

// @route   GET /api/applications
// @desc    Get applications with pagination, filtering, and search based on user role
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        // Extract query parameters
        const {
            page = 1,
            limit = 10,
            search = '',
            status = '',
            sortBy = 'createdAt',
            sortOrder = 'DESC'
        } = req.query;

        // Calculate offset for pagination
        const offset = (parseInt(page) - 1) * parseInt(limit);

        let query = {};

        // Get user details first
        const User = require('../models/User');
        const user = await User.findByPk(req.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        console.log('Current user details:', {
            id: user.id,
            userType: user.userType,
            sectorId: user.sectorId,
            churchId: user.churchId
        });

        // Filter based on user role
        if (user.userType === 'couple') {
            query.userId = req.userId;
        } else if (user.userType === 'church_leader') {
            // Church leaders can see all religious applications in their church
            query.churchId = user.churchId;
            query.ceremonyType = 'religious';
            // Remove status filter to show all applications including pending ones
        } else if (user.userType === 'civil_admin') {
            // Civil admins can see all applications in their sector for tracking and management
            query.sectorId = user.sectorId;
            // Remove status filter to show all applications including approved ones
        }

        // Add search functionality
        if (search) {
            query[Op.or] = [
                { applicationNumber: { [Op.like]: `%${search}%` } },
                { groomFirstName: { [Op.like]: `%${search}%` } },
                { groomLastName: { [Op.like]: `%${search}%` } },
                { brideFirstName: { [Op.like]: `%${search}%` } },
                { brideLastName: { [Op.like]: `%${search}%` } }
            ];
        }

        // Add status filter if provided
        if (status) {
            query.status = status;
        }

        // Get total count for pagination
        const totalCount = await MarriageApplication.count({ where: query });

        // Get applications with pagination and filtering
        const applications = await MarriageApplication.findAll({
            where: query,
            order: [[sortBy, sortOrder.toUpperCase()]],
            limit: parseInt(limit),
            offset: offset
        });

        // Calculate pagination info
        const totalPages = Math.ceil(totalCount / parseInt(limit));
        const hasNextPage = parseInt(page) < totalPages;
        const hasPrevPage = parseInt(page) > 1;

        console.log('Query used:', query);
        console.log('Applications found:', applications.length, 'Total:', totalCount);

        res.json({
            applications,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalCount,
                hasNextPage,
                hasPrevPage,
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Get applications error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/applications
// @desc    Create new marriage application
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        console.log('Creating religious marriage application with data:', {
            churchId: req.body.churchId,
            userId: req.userId,
            groomFirstName: req.body.groomFirstName,
            groomLastName: req.body.groomLastName,
            ceremonyType: req.body.ceremonyType,
            hasUploadedFiles: req.body.uploadedFiles ? req.body.uploadedFiles.length > 0 : false
        });

        // Prepare application data
        const applicationData = {
            ...req.body,
            userId: req.userId,
        };

        // For religious applications, set sectorId to null if not provided
        if (req.body.ceremonyType === 'religious') {
            applicationData.sectorId = null;
        }

        // Handle uploaded files
        if (req.body.uploadedFiles && Array.isArray(req.body.uploadedFiles)) {
            applicationData.documents = {
                uploadedFiles: req.body.uploadedFiles,
                uploadedAt: new Date().toISOString()
            };
        }

        console.log('Attempting to create application with data:', JSON.stringify(applicationData, null, 2));

        const application = await MarriageApplication.create(applicationData);

        console.log('Religious marriage application created successfully:', {
            id: application.id,
            applicationNumber: application.applicationNumber,
            churchId: application.churchId,
            ceremonyType: application.ceremonyType,
            userId: application.userId,
            hasDocuments: application.documents ? true : false
        });

        // Send notification to couple about application submission
        try {
            const user = await User.findByPk(req.userId);
            if (user) {
                const emailTemplate = NotificationService.getEmailTemplates().marriageApplicationSubmitted({
                    groomName: `${application.groomFirstName} ${application.groomLastName}`,
                    brideName: `${application.brideFirstName} ${application.brideLastName}`,
                    applicationId: application.applicationNumber,
                    submittedDate: new Date().toLocaleDateString(),
                    status: 'pending'
                });

                // Send email notification
                await NotificationService.sendEmail(
                    user.email,
                    emailTemplate.subject,
                    emailTemplate.html
                );

                // Create in-app notification
                await Notification.create({
                    userId: req.userId,
                    title: 'Marriage Application Submitted',
                    message: `Your marriage application has been submitted successfully. Application #${application.applicationNumber}`,
                    type: 'success',
                    relatedEntityType: 'marriage_application',
                    relatedEntityId: application.id,
                    data: {
                        applicationId: application.id,
                        applicationNumber: application.applicationNumber,
                        status: application.status
                    }
                });

                console.log(`✅ Marriage application notification sent to user: ${user.email}`);
            }
        } catch (error) {
            console.error(`❌ Failed to send marriage application notification:`, error.message);
        }

        res.status(201).json({
            message: 'Application submitted successfully',
            application,
        });
    } catch (error) {
        console.error('Create application error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/applications/:id
// @desc    Get specific application
// @access  Private
router.get('/:id', auth, async (req, res) => {
    try {
        const application = await MarriageApplication.findByPk(req.params.id);

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        res.json(application);
    } catch (error) {
        console.error('Get application error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/applications/:id/sector-approve
// @desc    Approve application at sector level (Civil Admin)
// @access  Private (Civil Admin only)
router.put('/:id/sector-approve', auth, authorize('civil_admin'), async (req, res) => {
    try {
        const application = await MarriageApplication.findByPk(req.params.id);

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        // Check if application is in the civil admin's sector
        const User = require('../models/User');
        const user = await User.findByPk(req.userId);

        if (application.sectorId !== user.sectorId) {
            return res.status(403).json({ message: 'You can only approve applications in your sector' });
        }

        // Check if application is in a state that can be sector-approved
        if (!['pending', 'under_review'].includes(application.status)) {
            return res.status(400).json({ message: 'Application is not in a state that can be sector-approved' });
        }

        await application.update({
            status: 'sector_approved',
            civilStatus: 'approved',
            civilAdminId: req.userId,
            civilReviewedAt: new Date()
        });

        // Send notification to couple about sector approval
        try {
            const couple = await User.findByPk(application.userId);
            if (couple) {
                const emailTemplate = NotificationService.getEmailTemplates().marriageApplicationSectorApproved({
                    groomName: `${application.groomFirstName} ${application.groomLastName}`,
                    brideName: `${application.brideFirstName} ${application.brideLastName}`,
                    applicationId: application.applicationNumber,
                    approvedDate: new Date().toLocaleDateString(),
                    status: 'sector_approved'
                });

                // Send email notification
                await NotificationService.sendEmail(
                    couple.email,
                    emailTemplate.subject,
                    emailTemplate.html
                );

                // Create in-app notification
                await Notification.create({
                    userId: application.userId,
                    title: 'Marriage Application Approved (Sector)',
                    message: `Your marriage application has been approved at the sector level. Application #${application.applicationNumber}`,
                    type: 'success',
                    relatedEntityType: 'marriage_application',
                    relatedEntityId: application.id,
                    data: {
                        applicationId: application.id,
                        applicationNumber: application.applicationNumber,
                        status: 'sector_approved',
                        previousStatus: 'pending'
                    }
                });

                console.log(`✅ Sector approval notification sent to couple: ${couple.email}`);
            }
        } catch (error) {
            console.error(`❌ Failed to send sector approval notification:`, error.message);
        }

        res.json({
            message: 'Application approved at sector level successfully',
            application
        });
    } catch (error) {
        console.error('Sector approve application error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/applications/:id/sector-reject
// @desc    Reject application at sector level (Civil Admin)
// @access  Private (Civil Admin only)
router.put('/:id/sector-reject', auth, authorize('civil_admin'), async (req, res) => {
    try {
        const { reason } = req.body;
        const application = await MarriageApplication.findByPk(req.params.id);

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        // Check if application is in the civil admin's sector
        const User = require('../models/User');
        const user = await User.findByPk(req.userId);

        if (application.sectorId !== user.sectorId) {
            return res.status(403).json({ message: 'You can only reject applications in your sector' });
        }

        // Check if application is in a state that can be sector-rejected
        if (!['pending', 'under_review'].includes(application.status)) {
            return res.status(400).json({ message: 'Application is not in a state that can be sector-rejected' });
        }

        await application.update({
            status: 'rejected',
            civilStatus: 'rejected',
            civilAdminId: req.userId,
            civilReviewedAt: new Date(),
            civilComments: reason
        });

        // Send notification to couple about sector rejection
        try {
            const couple = await User.findByPk(application.userId);
            if (couple) {
                const emailTemplate = NotificationService.getEmailTemplates().marriageApplicationRejected({
                    groomName: `${application.groomFirstName} ${application.groomLastName}`,
                    brideName: `${application.brideFirstName} ${application.brideLastName}`,
                    applicationId: application.applicationNumber,
                    rejectedDate: new Date().toLocaleDateString(),
                    status: 'rejected',
                    reason: reason
                });

                // Send email notification
                await NotificationService.sendEmail(
                    couple.email,
                    emailTemplate.subject,
                    emailTemplate.html
                );

                // Create in-app notification
                await Notification.create({
                    userId: application.userId,
                    title: 'Marriage Application Rejected (Sector)',
                    message: `Your marriage application has been rejected at the sector level. Application #${application.applicationNumber}`,
                    type: 'error',
                    relatedEntityType: 'marriage_application',
                    relatedEntityId: application.id,
                    data: {
                        applicationId: application.id,
                        applicationNumber: application.applicationNumber,
                        status: 'rejected',
                        previousStatus: 'pending',
                        reason: reason
                    }
                });

                console.log(`✅ Sector rejection notification sent to couple: ${couple.email}`);
            }
        } catch (error) {
            console.error(`❌ Failed to send sector rejection notification:`, error.message);
        }

        res.json({
            message: 'Application rejected at sector level successfully',
            application
        });
    } catch (error) {
        console.error('Sector reject application error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/applications/:id/church-approve
// @desc    Approve application at church level (Church Leader)
// @access  Private (Church Leader only)
router.put('/:id/church-approve', auth, authorize('church_leader'), async (req, res) => {
    try {
        const application = await MarriageApplication.findByPk(req.params.id);

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        // Check if application is in the church leader's church
        const User = require('../models/User');
        const user = await User.findByPk(req.userId);

        if (application.churchId !== user.churchId) {
            return res.status(403).json({ message: 'You can only approve applications in your church' });
        }

        // For religious applications, church leaders can approve directly without sector approval
        if (application.ceremonyType === 'religious') {
            // Allow church leaders to approve religious applications directly from pending status
            if (!['pending', 'under_review', 'sector_approved'].includes(application.status)) {
                return res.status(400).json({ message: 'Application is not in a state that can be approved' });
            }
        } else {
            // For non-religious applications, require sector approval
            if (application.status !== 'sector_approved') {
                return res.status(400).json({ message: 'Application must be approved by sector before church approval' });
            }
        }

        await application.update({
            status: 'approved',
            churchStatus: 'approved',
            churchLeaderId: req.userId,
            churchReviewedAt: new Date()
        });

        // Send notification to couple about church approval
        try {
            const couple = await User.findByPk(application.userId);
            if (couple) {
                const emailTemplate = NotificationService.getEmailTemplates().marriageApplicationApproved({
                    groomName: `${application.groomFirstName} ${application.groomLastName}`,
                    brideName: `${application.brideFirstName} ${application.brideLastName}`,
                    applicationId: application.applicationNumber,
                    approvedDate: new Date().toLocaleDateString(),
                    status: 'approved',
                    approvalType: application.ceremonyType === 'religious' ? 'Church' : 'Sector and Church'
                });

                // Send email notification
                await NotificationService.sendEmail(
                    couple.email,
                    emailTemplate.subject,
                    emailTemplate.html
                );

                // Create in-app notification
                await Notification.create({
                    userId: application.userId,
                    title: 'Religious Marriage Application Approved',
                    message: `Congratulations! Your religious marriage application has been approved by the church. Application #${application.applicationNumber}`,
                    type: 'success',
                    relatedEntityType: 'marriage_application',
                    relatedEntityId: application.id,
                    data: {
                        applicationId: application.id,
                        applicationNumber: application.applicationNumber,
                        status: 'approved',
                        previousStatus: application.ceremonyType === 'religious' ? 'pending' : 'sector_approved'
                    }
                });

                console.log(`✅ Church approval notification sent to couple: ${couple.email}`);
            }
        } catch (error) {
            console.error(`❌ Failed to send church approval notification:`, error.message);
        }

        res.json({
            message: 'Application approved at church level successfully',
            application
        });
    } catch (error) {
        console.error('Church approve application error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/applications/:id/church-reject
// @desc    Reject application at church level (Church Leader)
// @access  Private (Church Leader only)
router.put('/:id/church-reject', auth, authorize('church_leader'), async (req, res) => {
    try {
        const { reason } = req.body;
        const application = await MarriageApplication.findByPk(req.params.id);

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        // Check if application is in the church leader's church
        const User = require('../models/User');
        const user = await User.findByPk(req.userId);

        if (application.churchId !== user.churchId) {
            return res.status(403).json({ message: 'You can only reject applications in your church' });
        }

        // For religious applications, church leaders can reject directly without sector approval
        if (application.ceremonyType === 'religious') {
            // Allow church leaders to reject religious applications directly from pending status
            if (!['pending', 'under_review', 'sector_approved'].includes(application.status)) {
                return res.status(400).json({ message: 'Application is not in a state that can be rejected' });
            }
        } else {
            // For non-religious applications, require sector approval
            if (application.status !== 'sector_approved') {
                return res.status(400).json({ message: 'Application must be approved by sector before church rejection' });
            }
        }

        await application.update({
            status: 'rejected',
            churchStatus: 'rejected',
            churchLeaderId: req.userId,
            churchReviewedAt: new Date(),
            churchComments: reason
        });

        // Send notification to couple about church rejection
        try {
            const couple = await User.findByPk(application.userId);
            if (couple) {
                const emailTemplate = NotificationService.getEmailTemplates().marriageApplicationRejected({
                    groomName: `${application.groomFirstName} ${application.groomLastName}`,
                    brideName: `${application.brideFirstName} ${application.brideLastName}`,
                    applicationId: application.applicationNumber,
                    rejectedDate: new Date().toLocaleDateString(),
                    status: 'rejected',
                    reason: reason
                });

                // Send email notification
                await NotificationService.sendEmail(
                    couple.email,
                    emailTemplate.subject,
                    emailTemplate.html
                );

                // Create in-app notification
                await Notification.create({
                    userId: application.userId,
                    title: 'Religious Marriage Application Rejected',
                    message: `Your religious marriage application has been rejected by the church. Application #${application.applicationNumber}`,
                    type: 'error',
                    relatedEntityType: 'marriage_application',
                    relatedEntityId: application.id,
                    data: {
                        applicationId: application.id,
                        applicationNumber: application.applicationNumber,
                        status: 'rejected',
                        previousStatus: application.ceremonyType === 'religious' ? 'pending' : 'sector_approved',
                        reason: reason
                    }
                });

                console.log(`✅ Church rejection notification sent to couple: ${couple.email}`);
            }
        } catch (error) {
            console.error(`❌ Failed to send church rejection notification:`, error.message);
        }

        res.json({
            message: 'Application rejected at church level successfully',
            application
        });
    } catch (error) {
        console.error('Church reject application error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/applications/:id/complete
// @desc    Mark marriage as completed (Church Leader)
// @access  Private
router.put('/:id/complete', auth, authorize('church_leader'), async (req, res) => {
    try {
        const { marriageDate, marriageLocation, comments } = req.body;
        const application = await MarriageApplication.findByPk(req.params.id);

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        // Check if application is in the church leader's church
        const user = await User.findByPk(req.userId);

        if (application.churchId !== user.churchId) {
            return res.status(403).json({ message: 'You can only complete marriages in your church' });
        }

        // Check if application is approved or civil completed
        if (!['approved', 'civil_completed'].includes(application.status)) {
            return res.status(400).json({ message: 'Application must be approved or civil completed before marking as religious completed' });
        }

        await application.update({
            status: 'completed',
            marriageDate: marriageDate,
            marriageLocation: marriageLocation,
            completionComments: comments,
            completedBy: req.userId,
            completedAt: new Date()
        });

        // Send notification to couple about marriage completion
        try {
            const couple = await User.findByPk(application.userId);
            if (couple) {
                const emailTemplate = NotificationService.getEmailTemplates().marriageCompleted({
                    groomName: `${application.groomFirstName} ${application.groomLastName}`,
                    brideName: `${application.brideFirstName} ${application.brideLastName}`,
                    applicationId: application.applicationNumber,
                    marriageDate: marriageDate,
                    marriageLocation: marriageLocation,
                    status: 'completed'
                });

                // Send email notification
                await NotificationService.sendEmail(
                    couple.email,
                    emailTemplate.subject,
                    emailTemplate.html
                );

                // Create in-app notification
                await Notification.create({
                    userId: application.userId,
                    title: 'Marriage Completed',
                    message: `Congratulations! Your marriage has been completed. Application #${application.applicationNumber}`,
                    type: 'success',
                    relatedEntityType: 'marriage_application',
                    relatedEntityId: application.id,
                    data: {
                        applicationId: application.id,
                        applicationNumber: application.applicationNumber,
                        status: 'completed',
                        previousStatus: 'approved',
                        marriageDate: marriageDate,
                        marriageLocation: marriageLocation
                    }
                });

                console.log(`✅ Marriage completion notification sent to couple: ${couple.email}`);
            }
        } catch (error) {
            console.error(`❌ Failed to send marriage completion notification:`, error.message);
        }

        res.json({
            message: 'Marriage marked as completed successfully',
            application
        });
    } catch (error) {
        console.error('Complete marriage application error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Legacy routes for backward compatibility
// @route   PUT /api/applications/:id/approve
// @desc    Approve application (legacy - redirects to appropriate level)
// @access  Private
router.put('/:id/approve', auth, authorize('church_leader', 'civil_admin'), async (req, res) => {
    try {
        const User = require('../models/User');
        const user = await User.findByPk(req.userId);

        if (user.userType === 'civil_admin') {
            // Redirect to sector approval
            req.url = req.url.replace('/approve', '/sector-approve');
            return router.handle(req, res);
        } else if (user.userType === 'church_leader') {
            // Redirect to church approval
            req.url = req.url.replace('/approve', '/church-approve');
            return router.handle(req, res);
        }

        res.status(403).json({ message: 'Unauthorized' });
    } catch (error) {
        console.error('Legacy approve application error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/applications/:id/reject
// @desc    Reject application (legacy - redirects to appropriate level)
// @access  Private
router.put('/:id/reject', auth, authorize('church_leader', 'civil_admin'), async (req, res) => {
    try {
        const User = require('../models/User');
        const user = await User.findByPk(req.userId);

        if (user.userType === 'civil_admin') {
            // Redirect to sector rejection
            req.url = req.url.replace('/reject', '/sector-reject');
            return router.handle(req, res);
        } else if (user.userType === 'church_leader') {
            // Redirect to church rejection
            req.url = req.url.replace('/reject', '/church-reject');
            return router.handle(req, res);
        }

        res.status(403).json({ message: 'Unauthorized' });
    } catch (error) {
        console.error('Legacy reject application error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/applications/:id/civil-complete
// @desc    Mark marriage as civil completed (Civil Admin)
// @access  Private (Civil Admin)
router.put('/:id/civil-complete', auth, authorize('civil_admin'), async (req, res) => {
    try {
        const { civilMarriageDate, civilMarriageLocation, comments } = req.body;
        const application = await MarriageApplication.findByPk(req.params.id);

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        // Check if application is in the civil admin's sector
        const user = await User.findByPk(req.userId);

        if (application.sectorId !== user.sectorId) {
            return res.status(403).json({ message: 'You can only complete civil marriages in your sector' });
        }

        // Check if application is sector approved or approved
        if (!['sector_approved', 'approved'].includes(application.status)) {
            return res.status(400).json({ message: 'Application must be sector approved or approved before marking as civil completed' });
        }

        await application.update({
            status: 'civil_completed',
            civilMarriageDate: civilMarriageDate,
            civilMarriageLocation: civilMarriageLocation,
            civilCompletionComments: comments,
            civilCompletedBy: req.userId,
            civilCompletedAt: new Date()
        });

        // Send notification to couple about civil marriage completion
        try {
            const couple = await User.findByPk(application.userId);
            if (couple) {
                const emailTemplate = NotificationService.getEmailTemplates().civilMarriageCompleted({
                    groomName: `${application.groomFirstName} ${application.groomLastName}`,
                    brideName: `${application.brideFirstName} ${application.brideLastName}`,
                    applicationId: application.applicationNumber,
                    civilMarriageDate: civilMarriageDate,
                    civilMarriageLocation: civilMarriageLocation,
                    status: 'civil_completed'
                });

                // Send email notification
                await NotificationService.sendEmail(
                    couple.email,
                    emailTemplate.subject,
                    emailTemplate.html
                );

                // Create in-app notification
                await Notification.create({
                    userId: application.userId,
                    title: 'Civil Marriage Completed',
                    message: `Your civil marriage has been completed. Application #${application.applicationNumber}`,
                    type: 'success',
                    relatedEntityType: 'marriage_application',
                    relatedEntityId: application.id,
                    data: {
                        applicationId: application.id,
                        applicationNumber: application.applicationNumber,
                        status: 'civil_completed',
                        previousStatus: application.status,
                        civilMarriageDate: civilMarriageDate,
                        civilMarriageLocation: civilMarriageLocation
                    }
                });

                console.log(`✅ Civil marriage completion notification sent to couple: ${couple.email}`);
            }
        } catch (error) {
            console.error(`❌ Failed to send civil marriage completion notification:`, error.message);
        }

        res.json({
            message: 'Civil marriage marked as completed successfully',
            application
        });
    } catch (error) {
        console.error('Civil complete marriage application error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
