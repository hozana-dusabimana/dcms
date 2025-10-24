const express = require('express');
const router = express.Router();
const Sector = require('../models/Sector');
const { auth, authorize } = require('../middleware/auth-simple');

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
// @desc    Get all sectors (including inactive) - admin only
// @access  Private
router.get('/all', auth, authorize('civil_admin', 'super_admin'), async (req, res) => {
    try {
        const sectors = await Sector.findAll({
            order: [['name', 'ASC']]
        });

        res.json(sectors);
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