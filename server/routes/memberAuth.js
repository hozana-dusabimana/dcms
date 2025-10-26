const express = require('express');
const router = express.Router();
const { ChurchMember, Church } = require('../models');
const jwt = require('jsonwebtoken');

// @route   POST /api/member-auth/login
// @desc    Authenticate church member with phone number
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { phone } = req.body;

        if (!phone) {
            return res.status(400).json({ message: 'Phone number is required' });
        }

        // Find member by phone number
        const member = await ChurchMember.findOne({
            where: { phone },
            include: [
                {
                    model: Church,
                    as: 'church',
                    attributes: ['id', 'name', 'address']
                }
            ]
        });

        if (!member) {
            return res.status(404).json({ message: 'Member not found with this phone number' });
        }

        if (!member.isActive) {
            return res.status(403).json({ message: 'Your membership is currently inactive' });
        }

        // Create JWT token for member
        const token = jwt.sign(
            {
                memberId: member.id,
                phone: member.phone,
                churchId: member.churchId
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful',
            token,
            member: {
                id: member.id,
                firstName: member.firstName,
                lastName: member.lastName,
                phone: member.phone,
                church: member.church
            }
        });
    } catch (error) {
        console.error('Member login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/member-auth/verify
// @desc    Verify member token
// @access  Private (Member)
router.get('/verify', async (req, res) => {
    try {
        const token = req.header('x-auth-token');

        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const member = await ChurchMember.findByPk(decoded.memberId, {
            include: [
                {
                    model: Church,
                    as: 'church',
                    attributes: ['id', 'name', 'address']
                }
            ]
        });

        if (!member || !member.isActive) {
            return res.status(401).json({ message: 'Invalid token or inactive member' });
        }

        res.json({
            member: {
                id: member.id,
                firstName: member.firstName,
                lastName: member.lastName,
                phone: member.phone,
                church: member.church
            }
        });
    } catch (error) {
        console.error('Member token verification error:', error);
        res.status(401).json({ message: 'Invalid token' });
    }
});

module.exports = router;



