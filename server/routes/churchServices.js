const express = require('express');
const router = express.Router();
const { ChurchService, User, Church, ServiceComment, ChurchMember } = require('../models');
const { auth, authorize } = require('../middleware/auth-simple');

// @route   GET /api/church-services
// @desc    Get church services
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findByPk(req.userId);

        let whereClause = {};

        // Church leaders can only see services for their church
        if (user.userType === 'church_leader') {
            whereClause.churchId = user.churchId;
        }

        const services = await ChurchService.findAll({
            where: whereClause,
            include: [
                {
                    model: Church,
                    as: 'church',
                    attributes: ['id', 'name', 'address']
                },
                {
                    model: User,
                    as: 'officiant',
                    attributes: ['id', 'firstName', 'lastName']
                },
                {
                    model: User,
                    as: 'creator',
                    attributes: ['id', 'firstName', 'lastName']
                },
                {
                    model: ServiceComment,
                    as: 'comments',
                    include: [
                        {
                            model: ChurchMember,
                            as: 'member',
                            attributes: ['id', 'firstName', 'lastName']
                        }
                    ],
                    order: [['createdAt', 'DESC']]
                }
            ],
            order: [['scheduledDate', 'ASC']]
        });

        res.json({ services });
    } catch (error) {
        console.error('Get church services error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/church-services
// @desc    Create new church service
// @access  Private (Church Leader only)
router.post('/', auth, authorize('church_leader', 'super_admin'), async (req, res) => {
    try {
        const user = await User.findByPk(req.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.churchId) {
            return res.status(400).json({ message: 'User is not associated with a church' });
        }

        const {
            title,
            description,
            serviceType,
            scheduledDate,
            startTime,
            endTime,
            location,
            officiantId,
            status,
            maxAttendees,
            notes,
            isPublic
        } = req.body;

        // Prepare service data, only include officiantId if it's provided and not empty
        const serviceData = {
            title,
            description,
            serviceType,
            churchId: user.churchId,
            scheduledDate,
            startTime,
            endTime,
            location,
            status: status || 'scheduled',
            maxAttendees: maxAttendees ? parseInt(maxAttendees) : null,
            notes,
            isPublic: isPublic !== false, // default to true
            createdBy: req.userId
        };

        // Only add officiantId if it's provided and not empty
        if (officiantId && officiantId.trim() !== '') {
            serviceData.officiantId = parseInt(officiantId);
        }

        const service = await ChurchService.create(serviceData);

        // Fetch the created service with associations
        const createdService = await ChurchService.findByPk(service.id, {
            include: [
                {
                    model: Church,
                    as: 'church',
                    attributes: ['id', 'name', 'address']
                },
                {
                    model: User,
                    as: 'officiant',
                    attributes: ['id', 'firstName', 'lastName']
                },
                {
                    model: User,
                    as: 'creator',
                    attributes: ['id', 'firstName', 'lastName']
                }
            ]
        });

        res.status(201).json({
            message: 'Church service created successfully',
            service: createdService
        });
    } catch (error) {
        console.error('Create church service error:', error);

        // Handle specific database errors
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                message: 'Validation error',
                errors: error.errors.map(err => err.message)
            });
        }

        if (error.name === 'SequelizeForeignKeyConstraintError') {
            return res.status(400).json({
                message: 'Invalid reference: One or more referenced records do not exist'
            });
        }

        res.status(500).json({
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// @route   GET /api/church-services/:id
// @desc    Get specific church service
// @access  Private
router.get('/:id', auth, async (req, res) => {
    try {
        const user = await User.findByPk(req.userId);

        const service = await ChurchService.findByPk(req.params.id, {
            include: [
                {
                    model: Church,
                    as: 'church',
                    attributes: ['id', 'name', 'address']
                },
                {
                    model: User,
                    as: 'officiant',
                    attributes: ['id', 'firstName', 'lastName']
                },
                {
                    model: User,
                    as: 'creator',
                    attributes: ['id', 'firstName', 'lastName']
                },
                {
                    model: ServiceComment,
                    as: 'comments',
                    include: [
                        {
                            model: ChurchMember,
                            as: 'member',
                            attributes: ['id', 'firstName', 'lastName']
                        }
                    ],
                    order: [['createdAt', 'DESC']]
                }
            ]
        });

        if (!service) {
            return res.status(404).json({ message: 'Church service not found' });
        }

        // Check if user has access to this service
        if (user.userType === 'church_leader' && service.churchId !== user.churchId) {
            return res.status(403).json({ message: 'Access denied' });
        }

        res.json(service);
    } catch (error) {
        console.error('Get church service error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/church-services/:id/comments
// @desc    Get comments for a specific church service
// @access  Private (Church Leader only)
router.get('/:id/comments', auth, authorize('church_leader', 'super_admin'), async (req, res) => {
    try {
        const user = await User.findByPk(req.userId);

        const service = await ChurchService.findByPk(req.params.id);

        if (!service) {
            return res.status(404).json({ message: 'Church service not found' });
        }

        // Check if user has access to this service
        if (service.churchId !== user.churchId) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const comments = await ServiceComment.findAll({
            where: { serviceId: req.params.id },
            include: [
                {
                    model: ChurchMember,
                    as: 'member',
                    attributes: ['id', 'firstName', 'lastName']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json({ comments });
    } catch (error) {
        console.error('Get service comments error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/church-services/:id
// @desc    Update church service
// @access  Private (Church Leader only)
router.put('/:id', auth, authorize('church_leader', 'super_admin'), async (req, res) => {
    try {
        const user = await User.findByPk(req.userId);

        const service = await ChurchService.findByPk(req.params.id);

        if (!service) {
            return res.status(404).json({ message: 'Church service not found' });
        }

        // Check if user has access to this service
        if (service.churchId !== user.churchId) {
            return res.status(403).json({ message: 'Access denied' });
        }

        await service.update(req.body);

        // Fetch the updated service with associations
        const updatedService = await ChurchService.findByPk(service.id, {
            include: [
                {
                    model: Church,
                    as: 'church',
                    attributes: ['id', 'name', 'address']
                },
                {
                    model: User,
                    as: 'officiant',
                    attributes: ['id', 'firstName', 'lastName']
                },
                {
                    model: User,
                    as: 'creator',
                    attributes: ['id', 'firstName', 'lastName']
                }
            ]
        });

        res.json({
            message: 'Church service updated successfully',
            service: updatedService
        });
    } catch (error) {
        console.error('Update church service error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/church-services/:id
// @desc    Delete church service
// @access  Private (Church Leader only)
router.delete('/:id', auth, authorize('church_leader', 'super_admin'), async (req, res) => {
    try {
        const user = await User.findByPk(req.userId);

        const service = await ChurchService.findByPk(req.params.id);

        if (!service) {
            return res.status(404).json({ message: 'Church service not found' });
        }

        // Check if user has access to this service
        if (service.churchId !== user.churchId) {
            return res.status(403).json({ message: 'Access denied' });
        }

        await service.destroy();

        res.json({ message: 'Church service deleted successfully' });
    } catch (error) {
        console.error('Delete church service error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
