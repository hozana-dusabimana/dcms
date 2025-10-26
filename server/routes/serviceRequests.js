const express = require('express');
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const ServiceRequest = require('../models/ServiceRequest');
const ChurchMember = require('../models/ChurchMember');
const Church = require('../models/Church');
const User = require('../models/User');
const MemberNotification = require('../models/MemberNotification');
const { auth, authorize } = require('../middleware/auth-simple');
const NotificationService = require('../services/notificationService');

const router = express.Router();

// @route   GET /api/service-requests
// @desc    Get service requests (filtered by user role)
// @access  Private
router.get('/', auth, authorize('church_leader', 'civil_admin', 'super_admin'), async (req, res) => {
    try {
        const { userType, churchId, sectorId } = req.user;
        const { status, serviceType, priority, page = 1, limit = 10 } = req.query;

        let whereClause = {};
        let includeOptions = [
            {
                model: ChurchMember,
                as: 'member',
                include: [{
                    model: Church,
                    as: 'church'
                }]
            },
            {
                model: User,
                as: 'assignedTo',
                attributes: ['id', 'firstName', 'lastName', 'email']
            },
            {
                model: User,
                as: 'reviewer',
                attributes: ['id', 'firstName', 'lastName', 'email']
            }
        ];

        // Filter based on user role
        if (userType === 'church_leader') {
            whereClause['$member.church_id$'] = churchId;
        } else if (userType === 'civil_admin') {
            whereClause['$member.church.sector_id$'] = sectorId;
        } else if (userType === 'couple') {
            // Couples can only see their own requests (if they're also church members)
            const member = await ChurchMember.findOne({
                where: { userId: req.userId }
            });
            if (member) {
                whereClause.memberId = member.id;
            } else {
                return res.json({ requests: [], total: 0, pages: 0 });
            }
        }

        // Apply filters
        if (status) {
            whereClause.status = status;
        }
        if (serviceType) {
            whereClause.serviceType = serviceType;
        }
        if (priority) {
            whereClause.priority = priority;
        }

        const offset = (page - 1) * limit;

        const { count, rows: requests } = await ServiceRequest.findAndCountAll({
            where: whereClause,
            include: includeOptions,
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({
            requests,
            total: count,
            pages: Math.ceil(count / limit),
            currentPage: parseInt(page)
        });
    } catch (error) {
        console.error('Get service requests error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/service-requests/member
// @desc    Get service requests for a specific member (by phone)
// @access  Private (Member Auth)
router.get('/member', async (req, res) => {
    try {
        const token = req.headers['x-auth-token'];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        // Verify member token
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

        const member = await ChurchMember.findByPk(decoded.memberId, {
            include: [{
                model: Church,
                as: 'church'
            }]
        });

        if (!member) {
            return res.status(404).json({ message: 'Member not found' });
        }

        const { status, serviceType } = req.query;
        let whereClause = { memberId: member.id };

        if (status) {
            whereClause.status = status;
        }
        if (serviceType) {
            whereClause.serviceType = serviceType;
        }

        const requests = await ServiceRequest.findAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    as: 'assignedTo',
                    attributes: ['id', 'firstName', 'lastName']
                },
                {
                    model: User,
                    as: 'reviewer',
                    attributes: ['id', 'firstName', 'lastName']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json({ requests, member });
    } catch (error) {
        console.error('Get member service requests error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/service-requests
// @desc    Create a new service request
// @access  Private (Member Auth)
router.post('/', [
    body('serviceType').isIn(['baptism', 'marriage', 'funeral', 'communion', 'confirmation', 'dedication', 'other']).withMessage('Invalid service type'),
    body('title').notEmpty().withMessage('Title is required'),
    body('description').optional().isLength({ max: 1000 }).withMessage('Description too long'),
    body('requestedDate').optional().isISO8601().withMessage('Invalid date format'),
    body('preferredTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid time format'),
    body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
    body('estimatedAttendees').optional().isInt({ min: 1, max: 1000 }).withMessage('Invalid attendee count')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const token = req.headers['x-auth-token'];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        // Verify member token
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

        const member = await ChurchMember.findByPk(decoded.memberId);
        if (!member) {
            return res.status(404).json({ message: 'Member not found' });
        }

        const {
            serviceType,
            title,
            description,
            requestedDate,
            preferredTime,
            location,
            priority = 'medium',
            specialRequirements,
            contactPhone,
            contactEmail,
            estimatedAttendees,
            isUrgent = false
        } = req.body;

        // Generate request number
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 5).toUpperCase();
        const requestNumber = `REQ-${timestamp}-${random}`;

        const serviceRequest = await ServiceRequest.create({
            requestNumber,
            memberId: member.id,
            serviceType,
            title,
            description,
            requestedDate,
            preferredTime,
            location,
            priority,
            specialRequirements,
            contactPhone: contactPhone || member.phone,
            contactEmail: contactEmail || member.email,
            estimatedAttendees,
            isUrgent
        });

        // Fetch the created request with relations
        const createdRequest = await ServiceRequest.findByPk(serviceRequest.id, {
            include: [
                {
                    model: ChurchMember,
                    as: 'member',
                    include: [{
                        model: Church,
                        as: 'church'
                    }]
                }
            ]
        });

        // Send notification to member
        const emailTemplate = NotificationService.getEmailTemplates().serviceRequestSubmitted({
            memberName: `${member.firstName} ${member.lastName}`,
            churchName: createdRequest.member.church.name,
            requestNumber: createdRequest.requestNumber,
            serviceType: createdRequest.serviceType,
            title: createdRequest.title,
            requestedDate: createdRequest.requestedDate,
            status: createdRequest.status
        });

        // Send email notification to church member
        if (member.email) {
            try {
                await NotificationService.sendEmail(
                    member.email,
                    emailTemplate.subject,
                    emailTemplate.html
                );
                console.log(`✅ Email sent to church member: ${member.email}`);
            } catch (error) {
                console.error(`❌ Failed to send email to ${member.email}:`, error.message);
            }
        } else {
            console.log(`⚠️ No email address for church member: ${member.firstName} ${member.lastName}`);
        }

        // Create member notification
        try {
            await MemberNotification.create({
                memberId: member.id,
                title: 'Service Request Submitted',
                message: `Your ${createdRequest.serviceType} service request has been submitted successfully. Request #${createdRequest.requestNumber}`,
                type: 'success',
                relatedEntityType: 'service_request',
                relatedEntityId: createdRequest.id,
                data: {
                    requestId: createdRequest.id,
                    requestNumber: createdRequest.requestNumber,
                    serviceType: createdRequest.serviceType,
                    status: createdRequest.status
                }
            });
            console.log(`✅ Member notification created for member: ${member.id}`);
        } catch (error) {
            console.error(`❌ Failed to create member notification:`, error.message);
        }

        res.status(201).json({
            message: 'Service request created successfully',
            request: createdRequest
        });
    } catch (error) {
        console.error('Create service request error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/service-requests/:id
// @desc    Get a specific service request
// @access  Private
router.get('/:id', auth, authorize('church_leader', 'civil_admin', 'super_admin'), async (req, res) => {
    try {
        const { id } = req.params;
        const { userType, churchId, sectorId } = req.user;

        let whereClause = { id };

        // Apply role-based filtering
        if (userType === 'church_leader') {
            whereClause['$member.church_id$'] = churchId;
        } else if (userType === 'civil_admin') {
            whereClause['$member.church.sector_id$'] = sectorId;
        }

        const serviceRequest = await ServiceRequest.findOne({
            where: whereClause,
            include: [
                {
                    model: ChurchMember,
                    as: 'member',
                    include: [{
                        model: Church,
                        as: 'church'
                    }]
                },
                {
                    model: User,
                    as: 'assignedTo',
                    attributes: ['id', 'firstName', 'lastName', 'email']
                },
                {
                    model: User,
                    as: 'reviewer',
                    attributes: ['id', 'firstName', 'lastName', 'email']
                }
            ]
        });

        if (!serviceRequest) {
            return res.status(404).json({ message: 'Service request not found' });
        }

        res.json({ request: serviceRequest });
    } catch (error) {
        console.error('Get service request error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/service-requests/:id
// @desc    Update a service request (church leaders and super admins only)
// @access  Private
router.put('/:id', auth, authorize('church_leader', 'super_admin'), [
    body('status').optional().isIn(['pending', 'under_review', 'approved', 'scheduled', 'completed', 'rejected', 'cancelled']).withMessage('Invalid status'),
    body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
    body('reviewComments').optional().isLength({ max: 1000 }).withMessage('Review comments too long')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { id } = req.params;
        const { userType, churchId } = req.user;
        const updateData = req.body;

        // Find the service request
        let whereClause = { id };
        if (userType === 'church_leader') {
            whereClause['$member.church_id$'] = churchId;
        }

        const serviceRequest = await ServiceRequest.findOne({
            where: whereClause,
            include: [{
                model: ChurchMember,
                as: 'member'
            }]
        });

        if (!serviceRequest) {
            return res.status(404).json({ message: 'Service request not found' });
        }

        // Sanitize update data - convert empty strings to null for foreign keys
        if (updateData.assignedToId === '' || updateData.assignedToId === undefined) {
            updateData.assignedToId = null;
        }
        if (updateData.relatedServiceId === '' || updateData.relatedServiceId === undefined) {
            updateData.relatedServiceId = null;
        }

        // Check if status is being changed BEFORE updating
        const statusChanged = updateData.status && updateData.status !== serviceRequest.status;

        // Update review information if status is being changed
        if (statusChanged) {
            updateData.reviewedBy = req.userId;
            updateData.reviewedAt = new Date();
        }

        await serviceRequest.update(updateData);

        // Fetch updated request with relations
        const updatedRequest = await ServiceRequest.findByPk(id, {
            include: [
                {
                    model: ChurchMember,
                    as: 'member',
                    include: [{
                        model: Church,
                        as: 'church'
                    }]
                },
                {
                    model: User,
                    as: 'assignedTo',
                    attributes: ['id', 'firstName', 'lastName', 'email']
                },
                {
                    model: User,
                    as: 'reviewer',
                    attributes: ['id', 'firstName', 'lastName', 'email']
                }
            ]
        });

        // Send notification to member about status change
        console.log('🔍 Debug: Checking status change notification...', {
            updateDataStatus: updateData.status,
            currentStatus: serviceRequest.status,
            statusChanged: statusChanged,
            shouldNotify: statusChanged
        });

        if (statusChanged) {
            let emailTemplate;
            let notificationTitle;
            let notificationMessage;

            if (updateData.status === 'approved') {
                emailTemplate = NotificationService.getEmailTemplates().serviceRequestApproved({
                    memberName: `${updatedRequest.member.firstName} ${updatedRequest.member.lastName}`,
                    churchName: updatedRequest.member.church.name,
                    requestNumber: updatedRequest.requestNumber,
                    serviceType: updatedRequest.serviceType,
                    title: updatedRequest.title,
                    status: updatedRequest.status,
                    scheduledDate: updatedRequest.scheduledDate,
                    reviewComments: updatedRequest.reviewComments
                });
                notificationTitle = 'Service Request Approved';
                notificationMessage = `Your ${updatedRequest.serviceType} service request has been approved!`;
            } else if (updateData.status === 'rejected') {
                emailTemplate = NotificationService.getEmailTemplates().serviceRequestRejected({
                    memberName: `${updatedRequest.member.firstName} ${updatedRequest.member.lastName}`,
                    churchName: updatedRequest.member.church.name,
                    requestNumber: updatedRequest.requestNumber,
                    serviceType: updatedRequest.serviceType,
                    title: updatedRequest.title,
                    status: updatedRequest.status,
                    rejectionReason: updatedRequest.rejectionReason
                });
                notificationTitle = 'Service Request Update';
                notificationMessage = `Your ${updatedRequest.serviceType} service request has been ${updatedRequest.status}.`;
            } else {
                // Generic status change
                notificationTitle = 'Service Request Status Updated';
                notificationMessage = `Your ${updatedRequest.serviceType} service request status has been updated to ${updatedRequest.status}.`;
            }

            // Send email notification to church member
            if (updatedRequest.member.email) {
                try {
                    await NotificationService.sendEmail(
                        updatedRequest.member.email,
                        emailTemplate?.subject || notificationTitle,
                        emailTemplate?.html || `<p>${notificationMessage}</p>`
                    );
                    console.log(`✅ Status change email sent to church member: ${updatedRequest.member.email}`);
                } catch (error) {
                    console.error(`❌ Failed to send status change email to ${updatedRequest.member.email}:`, error.message);
                }
            } else {
                console.log(`⚠️ No email address for church member: ${updatedRequest.member.firstName} ${updatedRequest.member.lastName}`);
            }

            // Create member notification for status change
            console.log('🔔 Creating member notification...', {
                memberId: updatedRequest.member.id,
                title: notificationTitle,
                message: notificationMessage,
                type: updateData.status === 'approved' ? 'success' : updateData.status === 'rejected' ? 'error' : 'info'
            });

            try {
                await MemberNotification.create({
                    memberId: updatedRequest.member.id,
                    title: notificationTitle,
                    message: notificationMessage,
                    type: updateData.status === 'approved' ? 'success' : updateData.status === 'rejected' ? 'error' : 'info',
                    relatedEntityType: 'service_request',
                    relatedEntityId: updatedRequest.id,
                    data: {
                        requestId: updatedRequest.id,
                        requestNumber: updatedRequest.requestNumber,
                        serviceType: updatedRequest.serviceType,
                        status: updatedRequest.status,
                        previousStatus: serviceRequest.status
                    }
                });
                console.log(`✅ Status change member notification created for member: ${updatedRequest.member.id}`);
            } catch (error) {
                console.error(`❌ Failed to create status change member notification:`, error.message);
            }
        }

        res.json({
            message: 'Service request updated successfully',
            request: updatedRequest
        });
    } catch (error) {
        console.error('Update service request error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/service-requests/:id
// @desc    Delete a service request (church leaders and super admins only)
// @access  Private
router.delete('/:id', auth, authorize('church_leader', 'super_admin'), async (req, res) => {
    try {
        const { id } = req.params;
        const { userType, churchId } = req.user;

        let whereClause = { id };
        if (userType === 'church_leader') {
            whereClause['$member.church_id$'] = churchId;
        }

        const serviceRequest = await ServiceRequest.findOne({
            where: whereClause,
            include: [{
                model: ChurchMember,
                as: 'member'
            }]
        });

        if (!serviceRequest) {
            return res.status(404).json({ message: 'Service request not found' });
        }

        await serviceRequest.destroy();

        res.json({ message: 'Service request deleted successfully' });
    } catch (error) {
        console.error('Delete service request error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/service-requests/stats/summary
// @desc    Get service request statistics
// @access  Private
router.get('/stats/summary', auth, authorize('church_leader', 'civil_admin', 'super_admin'), async (req, res) => {
    try {
        const { userType, churchId, sectorId } = req.user;

        let whereClause = {};
        if (userType === 'church_leader') {
            whereClause['$member.church_id$'] = churchId;
        } else if (userType === 'civil_admin') {
            whereClause['$member.church.sector_id$'] = sectorId;
        }

        const stats = await ServiceRequest.findAll({
            where: whereClause,
            include: [{
                model: ChurchMember,
                as: 'member',
                include: [{
                    model: Church,
                    as: 'church'
                }]
            }],
            attributes: [
                'status',
                'serviceType',
                'priority',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            group: ['status', 'serviceType', 'priority']
        });

        res.json({ stats });
    } catch (error) {
        console.error('Get service request stats error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
