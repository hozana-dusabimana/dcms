const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth-simple');

// @route   GET /api/certificates
// @desc    Get user certificates
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        // Mock certificates data
        const certificates = [
            {
                id: '1',
                type: 'marriage',
                certificateNumber: 'MC2024001',
                issueDate: new Date(),
                status: 'issued',
            },
        ];

        res.json({ certificates });
    } catch (error) {
        console.error('Get certificates error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/certificates/verify
// @desc    Verify certificate
// @access  Public
router.post('/verify', async (req, res) => {
    try {
        const { certificateNumber } = req.body;

        // Mock verification
        const isValid = certificateNumber && certificateNumber.length > 0;

        res.json({
            valid: isValid,
            message: isValid ? 'Certificate is valid' : 'Certificate not found',
        });
    } catch (error) {
        console.error('Verify certificate error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;