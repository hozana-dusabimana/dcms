const express = require('express');
const router = express.Router();
const { CertificateRequest, MarriageApplication, User } = require('../models');
const { auth, authorize } = require('../middleware/auth-simple');
const { Op } = require('sequelize');

// @route   GET /api/certificate-requests
// @desc    Get certificate requests based on user role with pagination
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search = '',
            status = '',
            paymentStatus = '',
            certificateType = '',
            sortBy = 'createdAt',
            sortOrder = 'DESC'
        } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        let whereClause = {};
        const user = await User.findByPk(req.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Filter based on user role
        if (user.userType === 'couple') {
            whereClause.userId = req.userId;
        } else if (user.userType === 'civil_admin' || user.userType === 'super_admin') {
            // Admins can see all requests
        }

        // Search functionality
        if (search) {
            whereClause[Op.or] = [
                { requestNumber: { [Op.like]: `%${search}%` } },
                { paymentReference: { [Op.like]: `%${search}%` } }
            ];
        }

        // Status filters
        if (status) {
            whereClause.status = status;
        }
        if (paymentStatus) {
            whereClause.paymentStatus = paymentStatus;
        }
        if (certificateType) {
            whereClause.certificateType = certificateType;
        }

        const totalCount = await CertificateRequest.count({ where: whereClause });
        const certificateRequests = await CertificateRequest.findAll({
            where: whereClause,
            include: [
                {
                    model: MarriageApplication,
                    as: 'application',
                    attributes: ['id', 'applicationNumber', 'groomFirstName', 'groomLastName', 'brideFirstName', 'brideLastName', 'marriageDate']
                }
            ],
            order: [[sortBy, sortOrder.toUpperCase()]],
            limit: parseInt(limit),
            offset: offset
        });

        const totalPages = Math.ceil(totalCount / parseInt(limit));

        res.json({
            certificateRequests,
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
        console.error('Get certificate requests error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/certificate-requests
// @desc    Create new certificate request
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        const { applicationId, certificateType = 'sector' } = req.body;

        if (!applicationId) {
            return res.status(400).json({ message: 'Application ID is required' });
        }

        if (!['sector', 'church'].includes(certificateType)) {
            return res.status(400).json({ message: 'Certificate type must be either "sector" or "church"' });
        }

        // Check if application exists
        const application = await MarriageApplication.findByPk(applicationId);
        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        // Check if user owns the application
        if (application.userId !== req.userId) {
            return res.status(403).json({ message: 'You can only request certificates for your own applications' });
        }

        // Check application status based on certificate type
        if (certificateType === 'sector') {
            if (application.status !== 'sector_approved' && application.status !== 'approved') {
                return res.status(400).json({ message: 'Application must be approved by sector before requesting sector certificate' });
            }
        } else if (certificateType === 'church') {
            if (application.status !== 'approved') {
                return res.status(400).json({ message: 'Application must be approved by church before requesting church certificate' });
            }
        }

        // Check if certificate request already exists for this type
        const existingRequest = await CertificateRequest.findOne({
            where: { applicationId, userId: req.userId, certificateType }
        });

        if (existingRequest) {
            return res.status(400).json({ message: `${certificateType.charAt(0).toUpperCase() + certificateType.slice(1)} certificate request already exists for this application` });
        }

        // Generate request number with type prefix
        const typePrefix = certificateType === 'sector' ? 'SEC' : 'CHU';
        const requestNumber = `${typePrefix}-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

        // Create certificate request
        const certificateRequest = await CertificateRequest.create({
            applicationId,
            userId: req.userId,
            requestNumber,
            certificateType,
            status: 'pending',
            paymentStatus: 'pending'
        });

        res.status(201).json({
            message: `${certificateType.charAt(0).toUpperCase() + certificateType.slice(1)} certificate request created successfully`,
            certificateRequest
        });
    } catch (error) {
        console.error('Create certificate request error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/certificate-requests/available/:applicationId
// @desc    Get available certificate types for an application
// @access  Private
router.get('/available/:applicationId', auth, async (req, res) => {
    try {
        const application = await MarriageApplication.findByPk(req.params.applicationId);

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        // Check if user owns the application
        if (application.userId !== req.userId) {
            return res.status(403).json({ message: 'You can only check certificate availability for your own applications' });
        }

        const availableTypes = [];

        // Check if sector certificate is available
        if (application.status === 'sector_approved' || application.status === 'approved') {
            const existingSectorRequest = await CertificateRequest.findOne({
                where: { applicationId: application.id, userId: req.userId, certificateType: 'sector' }
            });

            if (!existingSectorRequest) {
                availableTypes.push({
                    type: 'sector',
                    name: 'Sector Certificate',
                    description: 'Civil marriage certificate issued by sector administration',
                    status: 'available'
                });
            } else {
                availableTypes.push({
                    type: 'sector',
                    name: 'Sector Certificate',
                    description: 'Civil marriage certificate issued by sector administration',
                    status: 'requested',
                    requestId: existingSectorRequest.id
                });
            }
        }

        // Check if church certificate is available
        if (application.status === 'approved') {
            const existingChurchRequest = await CertificateRequest.findOne({
                where: { applicationId: application.id, userId: req.userId, certificateType: 'church' }
            });

            if (!existingChurchRequest) {
                availableTypes.push({
                    type: 'church',
                    name: 'Church Certificate',
                    description: 'Religious marriage certificate issued by church authority',
                    status: 'available'
                });
            } else {
                availableTypes.push({
                    type: 'church',
                    name: 'Church Certificate',
                    description: 'Religious marriage certificate issued by church authority',
                    status: 'requested',
                    requestId: existingChurchRequest.id
                });
            }
        }

        res.json({
            applicationId: application.id,
            applicationStatus: application.status,
            availableTypes
        });
    } catch (error) {
        console.error('Get available certificate types error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/certificate-requests/:id/download
// @desc    Download certificate
// @access  Private
router.get('/:id/download', auth, async (req, res) => {
    try {
        const certificateRequest = await CertificateRequest.findByPk(req.params.id, {
            include: [
                {
                    model: MarriageApplication,
                    as: 'application'
                }
            ]
        });

        if (!certificateRequest) {
            return res.status(404).json({ message: 'Certificate request not found' });
        }

        // Check if user has access to this request
        const user = await User.findByPk(req.userId);

        if (user.userType === 'couple' && certificateRequest.userId !== req.userId) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Check if certificate is approved or issued
        if (certificateRequest.status !== 'approved' && certificateRequest.status !== 'issued') {
            return res.status(400).json({ message: 'Certificate is not ready for download' });
        }

        // Use the improved certificate generator
        const CertificateGenerator = require('../services/certificateGenerator');
        const certificateGenerator = new CertificateGenerator();

        // Generate the certificate
        const result = await certificateGenerator.generateCertificate(
            certificateRequest.application,
            certificateRequest
        );

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="marriage-certificate-${certificateRequest.requestNumber}.pdf"`);

        // Send the generated PDF file
        res.sendFile(result.filepath);

    } catch (error) {
        console.error('Download certificate error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/certificate-requests/:id
// @desc    Get specific certificate request
// @access  Private
router.get('/:id', auth, async (req, res) => {
    try {
        const certificateRequest = await CertificateRequest.findByPk(req.params.id, {
            include: [
                {
                    model: MarriageApplication,
                    as: 'application',
                    attributes: ['id', 'applicationNumber', 'groomFirstName', 'groomLastName', 'brideFirstName', 'brideLastName', 'marriageDate', 'ceremonyType', 'churchId', 'sectorId']
                }
            ]
        });

        if (!certificateRequest) {
            return res.status(404).json({ message: 'Certificate request not found' });
        }

        // Check if user has access to this request
        const user = await User.findByPk(req.userId);

        if (user.userType === 'couple' && certificateRequest.userId !== req.userId) {
            return res.status(403).json({ message: 'Access denied' });
        }

        res.json(certificateRequest);
    } catch (error) {
        console.error('Get certificate request error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/certificate-requests/:id/pay
// @desc    Mark certificate request as paid
// @access  Private
router.put('/:id/pay', auth, async (req, res) => {
    try {
        const { paymentReference } = req.body;

        const certificateRequest = await CertificateRequest.findByPk(req.params.id);

        if (!certificateRequest) {
            return res.status(404).json({ message: 'Certificate request not found' });
        }

        // Check if user owns the request
        if (certificateRequest.userId !== req.userId) {
            return res.status(403).json({ message: 'You can only pay for your own certificate requests' });
        }

        if (certificateRequest.paymentStatus === 'paid') {
            return res.status(400).json({ message: 'Certificate request is already paid' });
        }

        await certificateRequest.update({
            paymentStatus: 'paid',
            paymentReference,
            paymentDate: new Date(),
            status: 'paid'
        });

        res.json({
            message: 'Payment recorded successfully',
            certificateRequest
        });
    } catch (error) {
        console.error('Pay certificate request error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/certificate-requests/:id/approve
// @desc    Approve certificate request
// @access  Private (Admin only)
router.put('/:id/approve', auth, authorize('civil_admin', 'super_admin'), async (req, res) => {
    try {
        const certificateRequest = await CertificateRequest.findByPk(req.params.id, {
            include: [
                {
                    model: MarriageApplication,
                    as: 'application'
                }
            ]
        });

        if (!certificateRequest) {
            return res.status(404).json({ message: 'Certificate request not found' });
        }

        if (certificateRequest.paymentStatus !== 'paid') {
            return res.status(400).json({ message: 'Certificate request must be paid before approval' });
        }

        // Update certificate request as approved
        await certificateRequest.update({
            status: 'approved',
            approvedAt: new Date(),
            approvedBy: req.userId
        });

        res.json({
            message: 'Certificate request approved successfully',
            certificateRequest
        });
    } catch (error) {
        console.error('Approve certificate request error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/certificate-requests/:id/reject
// @desc    Reject certificate request
// @access  Private (Admin only)
router.put('/:id/reject', auth, authorize('civil_admin', 'super_admin'), async (req, res) => {
    try {
        const { reason } = req.body;

        const certificateRequest = await CertificateRequest.findByPk(req.params.id);

        if (!certificateRequest) {
            return res.status(404).json({ message: 'Certificate request not found' });
        }

        await certificateRequest.update({
            status: 'rejected',
            rejectionReason: reason
        });

        res.json({
            message: 'Certificate request rejected',
            certificateRequest
        });
    } catch (error) {
        console.error('Reject certificate request error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/certificate-requests/:id/issue
// @desc    Issue certificate (mark as issued)
// @access  Private (Admin only)
router.put('/:id/issue', auth, authorize('civil_admin', 'super_admin'), async (req, res) => {
    try {
        const certificateRequest = await CertificateRequest.findByPk(req.params.id);

        if (!certificateRequest) {
            return res.status(404).json({ message: 'Certificate request not found' });
        }

        if (certificateRequest.status !== 'approved') {
            return res.status(400).json({ message: 'Certificate request must be approved before issuing' });
        }

        await certificateRequest.update({
            status: 'issued',
            issuedAt: new Date(),
            issuedBy: req.userId
        });

        res.json({
            message: 'Certificate issued successfully',
            certificateRequest
        });
    } catch (error) {
        console.error('Issue certificate error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;