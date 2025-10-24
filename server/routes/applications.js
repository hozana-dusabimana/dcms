const express = require('express');
const router = express.Router();
const MarriageApplication = require('../models/MarriageApplication');
const { auth, authorize } = require('../middleware/auth-simple');

// @route   GET /api/applications
// @desc    Get applications based on user role
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        let query = {};

        // Get user details first
        const User = require('../models/User');
        const user = await User.findByPk(req.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        console.log('Current user details:', {
            id: user.id,
            userType: user.userType,
            sectorId: user.sectorId,
            churchId: user.churchId
        });

        // Filter based on user role
        if (user.userType === 'couple') {
            query.userId = req.userId;
        } else if (user.userType === 'church_leader') {
            query.churchId = user.churchId;
            // Church leaders can only see applications that are sector-approved
            query.status = 'sector_approved';
        } else if (user.userType === 'civil_admin') {
            // Civil admins can see applications in their sector that are pending or under review
            query.sectorId = user.sectorId;
            query.status = ['pending', 'under_review'];
        }

        const applications = await MarriageApplication.findAll({
            where: query,
            order: [['createdAt', 'DESC']]
        });

        console.log('Query used:', query);
        console.log('Applications found:', applications.length);
        console.log('Applications:', applications.map(app => ({
            id: app.id,
            applicationNumber: app.applicationNumber,
            sectorId: app.sectorId,
            userId: app.userId,
            groomFirstName: app.groomFirstName,
            groomLastName: app.groomLastName
        })));

        res.json({ applications });
    } catch (error) {
        console.error('Get applications error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/applications
// @desc    Create new marriage application
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        console.log('Creating application with data:', {
            sectorId: req.body.sectorId,
            userId: req.userId,
            groomFirstName: req.body.groomFirstName,
            groomLastName: req.body.groomLastName
        });

        const application = await MarriageApplication.create({
            ...req.body,
            userId: req.userId,
        });

        console.log('Application created successfully:', {
            id: application.id,
            applicationNumber: application.applicationNumber,
            sectorId: application.sectorId,
            userId: application.userId
        });

        res.status(201).json({
            message: 'Application submitted successfully',
            application,
        });
    } catch (error) {
        console.error('Create application error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/applications/:id
// @desc    Get specific application
// @access  Private
router.get('/:id', auth, async (req, res) => {
    try {
        const application = await MarriageApplication.findByPk(req.params.id);

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        res.json(application);
    } catch (error) {
        console.error('Get application error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/applications/:id/sector-approve
// @desc    Approve application at sector level (Civil Admin)
// @access  Private (Civil Admin only)
router.put('/:id/sector-approve', auth, authorize('civil_admin'), async (req, res) => {
    try {
        const application = await MarriageApplication.findByPk(req.params.id);

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        // Check if application is in the civil admin's sector
        const User = require('../models/User');
        const user = await User.findByPk(req.userId);

        if (application.sectorId !== user.sectorId) {
            return res.status(403).json({ message: 'You can only approve applications in your sector' });
        }

        // Check if application is in a state that can be sector-approved
        if (!['pending', 'under_review'].includes(application.status)) {
            return res.status(400).json({ message: 'Application is not in a state that can be sector-approved' });
        }

        await application.update({
            status: 'sector_approved',
            civilStatus: 'approved',
            civilAdminId: req.userId,
            civilReviewedAt: new Date()
        });

        res.json({
            message: 'Application approved at sector level successfully',
            application
        });
    } catch (error) {
        console.error('Sector approve application error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/applications/:id/sector-reject
// @desc    Reject application at sector level (Civil Admin)
// @access  Private (Civil Admin only)
router.put('/:id/sector-reject', auth, authorize('civil_admin'), async (req, res) => {
    try {
        const { reason } = req.body;
        const application = await MarriageApplication.findByPk(req.params.id);

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        // Check if application is in the civil admin's sector
        const User = require('../models/User');
        const user = await User.findByPk(req.userId);

        if (application.sectorId !== user.sectorId) {
            return res.status(403).json({ message: 'You can only reject applications in your sector' });
        }

        // Check if application is in a state that can be sector-rejected
        if (!['pending', 'under_review'].includes(application.status)) {
            return res.status(400).json({ message: 'Application is not in a state that can be sector-rejected' });
        }

        await application.update({
            status: 'rejected',
            civilStatus: 'rejected',
            civilAdminId: req.userId,
            civilReviewedAt: new Date(),
            civilComments: reason
        });

        res.json({
            message: 'Application rejected at sector level successfully',
            application
        });
    } catch (error) {
        console.error('Sector reject application error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/applications/:id/church-approve
// @desc    Approve application at church level (Church Leader)
// @access  Private (Church Leader only)
router.put('/:id/church-approve', auth, authorize('church_leader'), async (req, res) => {
    try {
        const application = await MarriageApplication.findByPk(req.params.id);

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        // Check if application is in the church leader's church
        const User = require('../models/User');
        const user = await User.findByPk(req.userId);

        if (application.churchId !== user.churchId) {
            return res.status(403).json({ message: 'You can only approve applications in your church' });
        }

        // Check if application is sector-approved
        if (application.status !== 'sector_approved') {
            return res.status(400).json({ message: 'Application must be approved by sector before church approval' });
        }

        await application.update({
            status: 'approved',
            churchStatus: 'approved',
            churchLeaderId: req.userId,
            churchReviewedAt: new Date()
        });

        res.json({
            message: 'Application approved at church level successfully',
            application
        });
    } catch (error) {
        console.error('Church approve application error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/applications/:id/church-reject
// @desc    Reject application at church level (Church Leader)
// @access  Private (Church Leader only)
router.put('/:id/church-reject', auth, authorize('church_leader'), async (req, res) => {
    try {
        const { reason } = req.body;
        const application = await MarriageApplication.findByPk(req.params.id);

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        // Check if application is in the church leader's church
        const User = require('../models/User');
        const user = await User.findByPk(req.userId);

        if (application.churchId !== user.churchId) {
            return res.status(403).json({ message: 'You can only reject applications in your church' });
        }

        // Check if application is sector-approved
        if (application.status !== 'sector_approved') {
            return res.status(400).json({ message: 'Application must be approved by sector before church rejection' });
        }

        await application.update({
            status: 'rejected',
            churchStatus: 'rejected',
            churchLeaderId: req.userId,
            churchReviewedAt: new Date(),
            churchComments: reason
        });

        res.json({
            message: 'Application rejected at church level successfully',
            application
        });
    } catch (error) {
        console.error('Church reject application error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Legacy routes for backward compatibility
// @route   PUT /api/applications/:id/approve
// @desc    Approve application (legacy - redirects to appropriate level)
// @access  Private
router.put('/:id/approve', auth, authorize('church_leader', 'civil_admin'), async (req, res) => {
    try {
        const User = require('../models/User');
        const user = await User.findByPk(req.userId);

        if (user.userType === 'civil_admin') {
            // Redirect to sector approval
            req.url = req.url.replace('/approve', '/sector-approve');
            return router.handle(req, res);
        } else if (user.userType === 'church_leader') {
            // Redirect to church approval
            req.url = req.url.replace('/approve', '/church-approve');
            return router.handle(req, res);
        }

        res.status(403).json({ message: 'Unauthorized' });
    } catch (error) {
        console.error('Legacy approve application error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/applications/:id/reject
// @desc    Reject application (legacy - redirects to appropriate level)
// @access  Private
router.put('/:id/reject', auth, authorize('church_leader', 'civil_admin'), async (req, res) => {
    try {
        const User = require('../models/User');
        const user = await User.findByPk(req.userId);

        if (user.userType === 'civil_admin') {
            // Redirect to sector rejection
            req.url = req.url.replace('/reject', '/sector-reject');
            return router.handle(req, res);
        } else if (user.userType === 'church_leader') {
            // Redirect to church rejection
            req.url = req.url.replace('/reject', '/church-reject');
            return router.handle(req, res);
        }

        res.status(403).json({ message: 'Unauthorized' });
    } catch (error) {
        console.error('Legacy reject application error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
