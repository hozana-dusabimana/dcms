const express = require('express');
const router = express.Router();
const Sector = require('../models/Sector');
const { auth, authorize } = require('../middleware/auth-simple');
const { Op } = require('sequelize');

// @route   GET /api/sectors
// @desc    Get all civil sectors
// @access  Public
router.get('/', async (req, res) => {
    try {
        const sectors = await Sector.findAll({
            where: { isActive: true },
            order: [['name', 'ASC']]
        });

        res.json(sectors);
    } catch (error) {
        console.error('Get sectors error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/sectors/all
// @desc    Get all sectors (including inactive) with pagination - admin only
// @access  Private
router.get('/all', auth, authorize('civil_admin', 'super_admin'), async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search = '',
            status = '',
            sortBy = 'name',
            sortOrder = 'ASC'
        } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        let whereClause = {};

        // Search functionality
        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { code: { [Op.like]: `%${search}%` } },
                { district: { [Op.like]: `%${search}%` } },
                { province: { [Op.like]: `%${search}%` } },
                { address: { [Op.like]: `%${search}%` } },
                { phone: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } }
            ];
        }

        // Status filter
        if (status !== '') {
            whereClause.isActive = status === 'active';
        }

        const totalCount = await Sector.count({ where: whereClause });
        const sectors = await Sector.findAll({
            where: whereClause,
            order: [[sortBy, sortOrder.toUpperCase()]],
            limit: parseInt(limit),
            offset: offset
        });

        const totalPages = Math.ceil(totalCount / parseInt(limit));

        res.json({
            sectors,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalCount,
                hasNextPage: parseInt(page) < totalPages,
                hasPrevPage: parseInt(page) > 1,
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Get all sectors error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/sectors
// @desc    Create new sector
// @access  Private
router.post('/', auth, authorize('civil_admin', 'super_admin'), async (req, res) => {
    try {
        const { name, code, district, province, address, phone, email } = req.body;

        const sector = await Sector.create({
            name,
            code,
            district,
            province,
            address,
            phone,
            email,
            isActive: true
        });

        res.status(201).json({ message: 'Sector created successfully', sector });
    } catch (error) {
        console.error('Create sector error:', error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: 'Sector code already exists' });
        }
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/sectors/:id
// @desc    Update sector
// @access  Private
router.put('/:id', auth, authorize('civil_admin', 'super_admin'), async (req, res) => {
    try {
        const { name, code, district, province, address, phone, email, isActive } = req.body;

        const sector = await Sector.findByPk(req.params.id);
        if (!sector) {
            return res.status(404).json({ message: 'Sector not found' });
        }

        await sector.update({
            name,
            code,
            district,
            province,
            address,
            phone,
            email,
            isActive
        });

        res.json({ message: 'Sector updated successfully', sector });
    } catch (error) {
        console.error('Update sector error:', error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: 'Sector code already exists' });
        }
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/sectors/:id
// @desc    Delete sector
// @access  Private
router.delete('/:id', auth, authorize('civil_admin', 'super_admin'), async (req, res) => {
    try {
        const sector = await Sector.findByPk(req.params.id);
        if (!sector) {
            return res.status(404).json({ message: 'Sector not found' });
        }

        await sector.destroy();

        res.json({ message: 'Sector deleted successfully' });
    } catch (error) {
        console.error('Delete sector error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;