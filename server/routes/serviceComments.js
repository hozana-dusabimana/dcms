const express = require('express');
const router = express.Router();
const { ServiceComment, ChurchService, ChurchMember, Church } = require('../models');
const jwt = require('jsonwebtoken');

// Middleware to authenticate member
const authenticateMember = async (req, res, next) => {
    try {
        const token = req.header('x-auth-token');

        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const member = await ChurchMember.findByPk(decoded.memberId);

        if (!member || !member.isActive) {
            return res.status(401).json({ message: 'Invalid token or inactive member' });
        }

        req.memberId = member.id;
        req.churchId = member.churchId;
        next();
    } catch (error) {
        console.error('Member authentication error:', error);
        res.status(401).json({ message: 'Invalid token' });
    }
};

// @route   GET /api/service-comments/services
// @desc    Get church services for member's church
// @access  Private (Member)
router.get('/services', authenticateMember, async (req, res) => {
    try {
        const services = await ChurchService.findAll({
            where: {
                churchId: req.churchId,
                isPublic: true
            },
            include: [
                {
                    model: Church,
                    as: 'church',
                    attributes: ['id', 'name', 'address']
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
        console.error('Get services error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/service-comments
// @desc    Add comment to a church service
// @access  Private (Member)
router.post('/', authenticateMember, async (req, res) => {
    try {
        const { serviceId, comment, commentType, isAnonymous } = req.body;

        if (!serviceId || !comment) {
            return res.status(400).json({ message: 'Service ID and comment are required' });
        }

        // Verify the service belongs to member's church
        const service = await ChurchService.findOne({
            where: {
                id: serviceId,
                churchId: req.churchId
            }
        });

        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        const serviceComment = await ServiceComment.create({
            serviceId,
            memberId: req.memberId,
            comment,
            commentType: commentType || 'general',
            isAnonymous: isAnonymous || false
        });

        // Fetch the created comment with member info
        const createdComment = await ServiceComment.findByPk(serviceComment.id, {
            include: [
                {
                    model: ChurchMember,
                    as: 'member',
                    attributes: ['id', 'firstName', 'lastName']
                }
            ]
        });

        res.status(201).json({
            message: 'Comment added successfully',
            comment: createdComment
        });
    } catch (error) {
        console.error('Add comment error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/service-comments/:serviceId
// @desc    Get comments for a specific service
// @access  Private (Member)
router.get('/:serviceId', authenticateMember, async (req, res) => {
    try {
        const { serviceId } = req.params;

        // Verify the service belongs to member's church
        const service = await ChurchService.findOne({
            where: {
                id: serviceId,
                churchId: req.churchId
            }
        });

        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        const comments = await ServiceComment.findAll({
            where: { serviceId },
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
        console.error('Get comments error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/service-comments/:id
// @desc    Update a comment (only by the author)
// @access  Private (Member)
router.put('/:id', authenticateMember, async (req, res) => {
    try {
        const { id } = req.params;
        const { comment, commentType } = req.body;

        const serviceComment = await ServiceComment.findByPk(id);

        if (!serviceComment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Check if the comment belongs to the authenticated member
        if (serviceComment.memberId !== req.memberId) {
            return res.status(403).json({ message: 'You can only edit your own comments' });
        }

        await serviceComment.update({
            comment,
            commentType: commentType || serviceComment.commentType
        });

        res.json({
            message: 'Comment updated successfully',
            comment: serviceComment
        });
    } catch (error) {
        console.error('Update comment error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/service-comments/:id
// @desc    Delete a comment (only by the author)
// @access  Private (Member)
router.delete('/:id', authenticateMember, async (req, res) => {
    try {
        const { id } = req.params;

        const serviceComment = await ServiceComment.findByPk(id);

        if (!serviceComment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Check if the comment belongs to the authenticated member
        if (serviceComment.memberId !== req.memberId) {
            return res.status(403).json({ message: 'You can only delete your own comments' });
        }

        await serviceComment.destroy();

        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        console.error('Delete comment error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;



