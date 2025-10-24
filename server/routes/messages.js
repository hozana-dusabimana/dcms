const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth-simple');

// @route   GET /api/messages
// @desc    Get user messages
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        // Mock messages data
        const messages = [
            {
                id: '1',
                sender: 'System',
                subject: 'Welcome to DMCS MIS',
                content: 'Welcome to the Digital Marriage and Church Service Management system.',
                timestamp: new Date(),
                isRead: false,
            },
        ];

        res.json({ messages });
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/messages
// @desc    Send message
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        const { recipient, subject, content } = req.body;

        // Mock message creation
        const message = {
            id: Date.now().toString(),
            sender: req.user._id,
            recipient,
            subject,
            content,
            timestamp: new Date(),
        };

        res.status(201).json({
            message: 'Message sent successfully',
            data: message,
        });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;