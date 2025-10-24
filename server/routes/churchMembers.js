const express = require('express');
const router = express.Router();
const { ChurchMember, User, Church } = require('../models');
const { auth, authorize } = require('../middleware/auth-simple');

// @route   GET /api/church-members
// @desc    Get church members
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findByPk(req.userId);

        let whereClause = {};

        // Church leaders can only see members of their church
        if (user.userType === 'church_leader') {
            whereClause.churchId = user.churchId;
        }

        const members = await ChurchMember.findAll({
            where: whereClause,
            include: [
                {
                    model: Church,
                    as: 'church',
                    attributes: ['id', 'name', 'address']
                },
                {
                    model: User,
                    as: 'creator',
                    attributes: ['id', 'firstName', 'lastName']
                }
            ],
            order: [['lastName', 'ASC'], ['firstName', 'ASC']]
        });

        res.json({ members });
    } catch (error) {
        console.error('Get church members error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/church-members
// @desc    Create new church member
// @access  Private (Church Leader only)
router.post('/', auth, authorize('church_leader', 'super_admin'), async (req, res) => {
    try {
        const user = await User.findByPk(req.userId);

        // Generate membership number if not provided
        let membershipNumber = req.body.membershipNumber;
        if (!membershipNumber) {
            const memberCount = await ChurchMember.count({ where: { churchId: user.churchId } });
            membershipNumber = `MEM-${user.churchId}-${String(memberCount + 1).padStart(4, '0')}`;
        }

        const member = await ChurchMember.create({
            ...req.body,
            churchId: user.churchId,
            membershipNumber,
            createdBy: req.userId
        });

        // Fetch the created member with associations
        const createdMember = await ChurchMember.findByPk(member.id, {
            include: [
                {
                    model: Church,
                    as: 'church',
                    attributes: ['id', 'name', 'address']
                },
                {
                    model: User,
                    as: 'creator',
                    attributes: ['id', 'firstName', 'lastName']
                }
            ]
        });

        res.status(201).json({
            message: 'Church member created successfully',
            member: createdMember
        });
    } catch (error) {
        console.error('Create church member error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/church-members/:id
// @desc    Get specific church member
// @access  Private
router.get('/:id', auth, async (req, res) => {
    try {
        const user = await User.findByPk(req.userId);

        const member = await ChurchMember.findByPk(req.params.id, {
            include: [
                {
                    model: Church,
                    as: 'church',
                    attributes: ['id', 'name', 'address']
                },
                {
                    model: User,
                    as: 'creator',
                    attributes: ['id', 'firstName', 'lastName']
                }
            ]
        });

        if (!member) {
            return res.status(404).json({ message: 'Church member not found' });
        }

        // Check if user has access to this member
        if (user.userType === 'church_leader' && member.churchId !== user.churchId) {
            return res.status(403).json({ message: 'Access denied' });
        }

        res.json(member);
    } catch (error) {
        console.error('Get church member error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/church-members/:id
// @desc    Update church member
// @access  Private (Church Leader only)
router.put('/:id', auth, authorize('church_leader', 'super_admin'), async (req, res) => {
    try {
        const user = await User.findByPk(req.userId);

        const member = await ChurchMember.findByPk(req.params.id);

        if (!member) {
            return res.status(404).json({ message: 'Church member not found' });
        }

        // Check if user has access to this member
        if (member.churchId !== user.churchId) {
            return res.status(403).json({ message: 'Access denied' });
        }

        await member.update(req.body);

        // Fetch the updated member with associations
        const updatedMember = await ChurchMember.findByPk(member.id, {
            include: [
                {
                    model: Church,
                    as: 'church',
                    attributes: ['id', 'name', 'address']
                },
                {
                    model: User,
                    as: 'creator',
                    attributes: ['id', 'firstName', 'lastName']
                }
            ]
        });

        res.json({
            message: 'Church member updated successfully',
            member: updatedMember
        });
    } catch (error) {
        console.error('Update church member error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/church-members/:id
// @desc    Delete church member
// @access  Private (Church Leader only)
router.delete('/:id', auth, authorize('church_leader', 'super_admin'), async (req, res) => {
    try {
        const user = await User.findByPk(req.userId);

        const member = await ChurchMember.findByPk(req.params.id);

        if (!member) {
            return res.status(404).json({ message: 'Church member not found' });
        }

        // Check if user has access to this member
        if (member.churchId !== user.churchId) {
            return res.status(403).json({ message: 'Access denied' });
        }

        await member.destroy();

        res.json({ message: 'Church member deleted successfully' });
    } catch (error) {
        console.error('Delete church member error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
