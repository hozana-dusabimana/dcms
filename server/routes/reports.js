const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const MarriageApplication = require('../models/MarriageApplication');
const User = require('../models/User');
const Church = require('../models/Church');
const { auth, authorize } = require('../middleware/auth-simple');

// @route   GET /api/reports/:type
// @desc    Get reports based on type
// @access  Private
router.get('/:type', auth, authorize('civil_admin', 'super_admin'), async (req, res) => {
    try {
        const { type } = req.params;
        const { days = 30 } = req.query;

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));

        let reportData = {};

        switch (type) {
            case 'applications':
                const applications = await MarriageApplication.findAll({
                    where: {
                        createdAt: {
                            [Op.gte]: startDate
                        }
                    },
                    order: [['createdAt', 'DESC']]
                });

                reportData = {
                    totalApplications: applications.length,
                    approvedApplications: applications.filter(app => app.status === 'approved').length,
                    pendingApplications: applications.filter(app => app.status === 'pending').length,
                    rejectedApplications: applications.filter(app => app.status === 'rejected').length,
                    details: applications.map(app => ({
                        id: app.id,
                        date: app.createdAt,
                        groomName: app.groomName,
                        brideName: app.brideName,
                        status: app.status,
                        churchName: app.churchName || 'N/A'
                    }))
                };
                break;

            case 'users':
                const users = await User.findAll({
                    where: {
                        createdAt: {
                            [Op.gte]: startDate
                        }
                    },
                    order: [['createdAt', 'DESC']]
                });

                reportData = {
                    totalUsers: users.length,
                    activeUsers: users.filter(user => user.isActive).length,
                    inactiveUsers: users.filter(user => !user.isActive).length,
                    userTypes: {
                        couple: users.filter(user => user.userType === 'couple').length,
                        church_leader: users.filter(user => user.userType === 'church_leader').length,
                        civil_admin: users.filter(user => user.userType === 'civil_admin').length,
                        super_admin: users.filter(user => user.userType === 'super_admin').length
                    },
                    details: users.map(user => ({
                        id: user.id,
                        date: user.createdAt,
                        name: `${user.firstName} ${user.lastName}`,
                        email: user.email,
                        userType: user.userType,
                        isActive: user.isActive
                    }))
                };
                break;

            case 'churches':
                const churches = await Church.findAll({
                    order: [['createdAt', 'DESC']]
                });

                reportData = {
                    totalChurches: churches.length,
                    activeChurches: churches.filter(church => church.isActive).length,
                    details: churches.map(church => ({
                        id: church.id,
                        name: church.name,
                        denomination: church.denomination,
                        location: church.location,
                        isActive: church.isActive
                    }))
                };
                break;

            default:
                return res.status(400).json({ message: 'Invalid report type' });
        }

        res.json(reportData);
    } catch (error) {
        console.error('Get reports error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
