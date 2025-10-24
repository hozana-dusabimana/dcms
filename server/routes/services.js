const express = require('express');
const router = express.Router();

// @route   GET /api/services
// @desc    Get all services
// @access  Public
router.get('/', async (req, res) => {
    try {
        const services = [
            {
                id: 1,
                name: 'Marriage Registration',
                description: 'Complete marriage registration process',
                type: 'registration',
            },
            {
                id: 2,
                name: 'Baptism Services',
                description: 'Baptism ceremony arrangements',
                type: 'ceremony',
            },
            {
                id: 3,
                name: 'Confirmation',
                description: 'Confirmation ceremony services',
                type: 'ceremony',
            },
        ];

        res.json({ services });
    } catch (error) {
        console.error('Get services error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
