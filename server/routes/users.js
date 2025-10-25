const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const User = require('../models/User');
const Church = require('../models/Church');
const Sector = require('../models/Sector');
const { auth, authorize } = require('../middleware/auth-simple');

// Test route without authorization
router.get('/test', async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password'] },
            order: [['createdAt', 'DESC']]
        });
        res.json({ message: 'Test successful', count: users.length });
    } catch (error) {
        console.error('Test route error:', error);
        res.status(500).json({ message: 'Test error', error: error.message });
    }
});

// @route   GET /api/users
// @desc    Get all users with pagination, filtering, and search (admin only)
// @access  Private
router.get('/', auth, authorize('civil_admin', 'super_admin'), async (req, res) => {
    try {
        console.log('Users route called, req.user:', req.user);

        // Extract query parameters
        const {
            page = 1,
            limit = 10,
            search = '',
            userType = '',
            isActive = '',
            sortBy = 'createdAt',
            sortOrder = 'DESC'
        } = req.query;

        // Calculate offset for pagination
        const offset = (parseInt(page) - 1) * parseInt(limit);

        // Build where clause for filtering
        const whereClause = {};

        // Search functionality
        if (search) {
            whereClause[Op.or] = [
                { firstName: { [Op.like]: `%${search}%` } },
                { lastName: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } },
                { username: { [Op.like]: `%${search}%` } }
            ];
        }

        // Filter by user type
        if (userType) {
            whereClause.userType = userType;
        }

        // Filter by active status
        if (isActive !== '') {
            whereClause.isActive = isActive === 'true';
        }

        // Get total count for pagination
        const totalCount = await User.count({ where: whereClause });

        // Get users with pagination and filtering
        const users = await User.findAll({
            where: whereClause,
            attributes: { exclude: ['password'] },
            order: [[sortBy, sortOrder.toUpperCase()]],
            limit: parseInt(limit),
            offset: offset
        });

        // Calculate pagination info
        const totalPages = Math.ceil(totalCount / parseInt(limit));
        const hasNextPage = parseInt(page) < totalPages;
        const hasPrevPage = parseInt(page) > 1;

        console.log('Users found:', users.length, 'Total:', totalCount);

        res.json({
            users,
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
        console.error('Get users error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private
router.put('/:id', auth, authorize('civil_admin', 'super_admin'), async (req, res) => {
    try {
        const { firstName, lastName, email, userType, isActive } = req.body;

        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await user.update({
            firstName,
            lastName,
            email,
            userType,
            isActive
        });

        res.json({ message: 'User updated successfully', user });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/users/:id/status
// @desc    Update user status
// @access  Private
router.put('/:id/status', auth, authorize('civil_admin', 'super_admin'), async (req, res) => {
    try {
        const { isActive } = req.body;

        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await user.update({ isActive });

        res.json({ message: 'User status updated successfully', user });
    } catch (error) {
        console.error('Update user status error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Private
router.delete('/:id', auth, authorize('civil_admin', 'super_admin'), async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent deleting own account
        if (user.id === req.user.id) {
            return res.status(400).json({ message: 'Cannot delete your own account' });
        }

        await user.destroy();

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
