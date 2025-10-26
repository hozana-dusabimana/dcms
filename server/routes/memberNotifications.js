const express = require('express');
const { memberAuth } = require('../middleware/auth-simple');
const MemberNotification = require('../models/MemberNotification');

const router = express.Router();

// @route   GET /api/member-notifications
// @desc    Get member notifications
// @access  Private (Member)
router.get('/', memberAuth, async (req, res) => {
    try {
        const { page = 1, limit = 20, unreadOnly = false } = req.query;
        const offset = (page - 1) * limit;

        let whereClause = { memberId: req.memberId };
        if (unreadOnly === 'true') {
            whereClause.isRead = false;
        }

        const { count, rows: notifications } = await MemberNotification.findAndCountAll({
            where: whereClause,
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({
            notifications,
            total: count,
            pages: Math.ceil(count / limit),
            currentPage: parseInt(page)
        });
    } catch (error) {
        console.error('Get member notifications error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/member-notifications/unread-count
// @desc    Get unread notifications count
// @access  Private (Member)
router.get('/unread-count', memberAuth, async (req, res) => {
    try {
        const count = await MemberNotification.count({
            where: {
                memberId: req.memberId,
                isRead: false
            }
        });

        res.json({ count });
    } catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/member-notifications/:id/read
// @desc    Mark notification as read
// @access  Private (Member)
router.put('/:id/read', memberAuth, async (req, res) => {
    try {
        const { id } = req.params;

        const notification = await MemberNotification.findOne({
            where: {
                id: id,
                memberId: req.memberId
            }
        });

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        await notification.update({
            isRead: true,
            readAt: new Date()
        });

        res.json({ message: 'Notification marked as read' });
    } catch (error) {
        console.error('Mark notification as read error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/member-notifications/mark-all-read
// @desc    Mark all notifications as read
// @access  Private (Member)
router.put('/mark-all-read', memberAuth, async (req, res) => {
    try {
        await MemberNotification.update(
            {
                isRead: true,
                readAt: new Date()
            },
            {
                where: {
                    memberId: req.memberId,
                    isRead: false
                }
            }
        );

        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Mark all notifications as read error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/member-notifications/:id
// @desc    Delete notification
// @access  Private (Member)
router.delete('/:id', memberAuth, async (req, res) => {
    try {
        const { id } = req.params;

        const notification = await MemberNotification.findOne({
            where: {
                id: id,
                memberId: req.memberId
            }
        });

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        await notification.destroy();

        res.json({ message: 'Notification deleted successfully' });
    } catch (error) {
        console.error('Delete notification error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

