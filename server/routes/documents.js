const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const router = express.Router();
const Document = require('../models/Document');
const { auth } = require('../middleware/auth-simple');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        // Allow only certain file types
        const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only images and documents are allowed'));
        }
    }
});

// @route   GET /api/documents
// @desc    Get user documents
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const { category, page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const whereClause = {
            userId: req.userId,
            isActive: true
        };

        if (category) {
            whereClause.category = category;
        }

        const documents = await Document.findAndCountAll({
            where: whereClause,
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({
            documents: documents.rows,
            totalCount: documents.count,
            currentPage: parseInt(page),
            totalPages: Math.ceil(documents.count / limit)
        });
    } catch (error) {
        console.error('Get documents error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/documents/upload
// @desc    Upload a document
// @access  Private
router.post('/upload', auth, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const { category, description, isPublic, relatedEntityType, relatedEntityId } = req.body;

        const document = await Document.create({
            userId: req.userId,
            originalName: req.file.originalname,
            filename: req.file.filename,
            filePath: req.file.path,
            fileSize: req.file.size,
            mimeType: req.file.mimetype,
            category: category || 'other',
            description: description || null,
            isPublic: isPublic === 'true',
            relatedEntityType: relatedEntityType || null,
            relatedEntityId: relatedEntityId || null
        });

        res.status(201).json({
            message: 'File uploaded successfully',
            document
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Upload failed' });
    }
});

// @route   GET /api/documents/:id
// @desc    Get document details
// @access  Private
router.get('/:id', auth, async (req, res) => {
    try {
        const document = await Document.findOne({
            where: {
                id: req.params.id,
                userId: req.userId,
                isActive: true
            }
        });

        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        res.json({ document });
    } catch (error) {
        console.error('Get document error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/documents/:id/download
// @desc    Download a document
// @access  Private
router.get('/:id/download', auth, async (req, res) => {
    try {
        const document = await Document.findOne({
            where: {
                id: req.params.id,
                userId: req.userId,
                isActive: true
            }
        });

        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        // Check if file exists
        try {
            await fs.access(document.filePath);
        } catch (error) {
            return res.status(404).json({ message: 'File not found on server' });
        }

        res.download(document.filePath, document.originalName);
    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({ message: 'Download failed' });
    }
});

// @route   PUT /api/documents/:id
// @desc    Update document details
// @access  Private
router.put('/:id', auth, async (req, res) => {
    try {
        const { category, description, isPublic } = req.body;

        const document = await Document.findOne({
            where: {
                id: req.params.id,
                userId: req.userId,
                isActive: true
            }
        });

        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        await document.update({
            category: category || document.category,
            description: description !== undefined ? description : document.description,
            isPublic: isPublic !== undefined ? isPublic : document.isPublic
        });

        res.json({
            message: 'Document updated successfully',
            document
        });
    } catch (error) {
        console.error('Update document error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/documents/:id
// @desc    Delete a document
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const document = await Document.findOne({
            where: {
                id: req.params.id,
                userId: req.userId,
                isActive: true
            }
        });

        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        // Soft delete - mark as inactive
        await document.update({ isActive: false });

        // Optionally delete the physical file
        try {
            await fs.unlink(document.filePath);
        } catch (error) {
            console.error('Error deleting physical file:', error);
            // Continue even if physical file deletion fails
        }

        res.json({ message: 'Document deleted successfully' });
    } catch (error) {
        console.error('Delete document error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/documents/categories
// @desc    Get document categories
// @access  Private
router.get('/categories', auth, async (req, res) => {
    try {
        const categories = [
            { value: 'birth_certificate', label: 'Birth Certificate' },
            { value: 'id_card', label: 'National ID Card' },
            { value: 'baptism_certificate', label: 'Baptism Certificate' },
            { value: 'divorce_certificate', label: 'Divorce Certificate' },
            { value: 'death_certificate', label: 'Death Certificate' },
            { value: 'marriage_certificate', label: 'Marriage Certificate' },
            { value: 'other', label: 'Other' }
        ];

        res.json({ categories });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
