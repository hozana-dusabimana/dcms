const express = require('express');
const router = express.Router();
const Church = require('../models/Church');
const { auth, authorize } = require('../middleware/auth-simple');

// @route   GET /api/churches
// @desc    Get all churches
// @access  Public
router.get('/', async (req, res) => {
    try {
        const churches = await Church.findAll({
            where: { isActive: true },
            order: [['name', 'ASC']]
        });

        res.json(churches);
    } catch (error) {
        console.error('Get churches error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/churches/all
// @desc    Get all churches (including inactive) - admin only
// @access  Private
router.get('/all', auth, authorize('civil_admin', 'super_admin'), async (req, res) => {
    try {
        const churches = await Church.findAll({
            order: [['name', 'ASC']]
        });

        res.json(churches);
    } catch (error) {
        console.error('Get all churches error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/churches/:id
// @desc    Get specific church
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const church = await Church.findByPk(req.params.id);

        if (!church) {
            return res.status(404).json({ message: 'Church not found' });
        }

        res.json(church);
    } catch (error) {
        console.error('Get church error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/churches
// @desc    Create new church
// @access  Private
router.post('/', auth, authorize('civil_admin', 'super_admin'), async (req, res) => {
    try {
        const { name, denomination, address, location, phone, email, website, description } = req.body;

        const church = await Church.create({
            name,
            denomination,
            address,
            location,
            phone,
            email,
            website,
            description,
            isActive: true
        });

        res.status(201).json({ message: 'Church created successfully', church });
    } catch (error) {
        console.error('Create church error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/churches/:id
// @desc    Update church
// @access  Private
router.put('/:id', auth, authorize('civil_admin', 'super_admin'), async (req, res) => {
    try {
        const { name, denomination, address, location, phone, email, website, description, isActive } = req.body;

        const church = await Church.findByPk(req.params.id);
        if (!church) {
            return res.status(404).json({ message: 'Church not found' });
        }

        await church.update({
            name,
            denomination,
            address,
            location,
            phone,
            email,
            website,
            description,
            isActive
        });

        res.json({ message: 'Church updated successfully', church });
    } catch (error) {
        console.error('Update church error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/churches/:id
// @desc    Delete church
// @access  Private
router.delete('/:id', auth, authorize('civil_admin', 'super_admin'), async (req, res) => {
    try {
        const church = await Church.findByPk(req.params.id);
        if (!church) {
            return res.status(404).json({ message: 'Church not found' });
        }

        await church.destroy();

        res.json({ message: 'Church deleted successfully' });
    } catch (error) {
        console.error('Delete church error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;