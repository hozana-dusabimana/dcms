const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ServiceRequest = sequelize.define('ServiceRequest', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    requestNumber: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        field: 'request_number'
    },
    memberId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'member_id',
        references: {
            model: 'church_members',
            key: 'id'
        }
    },
    serviceType: {
        type: DataTypes.ENUM('baptism', 'marriage', 'funeral', 'communion', 'confirmation', 'dedication', 'other'),
        allowNull: false,
        field: 'service_type'
    },
    title: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    requestedDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        field: 'requested_date'
    },
    preferredTime: {
        type: DataTypes.TIME,
        allowNull: true,
        field: 'preferred_time'
    },
    location: {
        type: DataTypes.STRING(200),
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('pending', 'under_review', 'approved', 'scheduled', 'completed', 'rejected', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending'
    },
    priority: {
        type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
        allowNull: false,
        defaultValue: 'medium'
    },
    specialRequirements: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'special_requirements'
    },
    contactPhone: {
        type: DataTypes.STRING(20),
        allowNull: true,
        field: 'contact_phone'
    },
    contactEmail: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'contact_email'
    },
    estimatedAttendees: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'estimated_attendees'
    },
    // Related entities
    relatedServiceId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'related_service_id',
        references: {
            model: 'church_services',
            key: 'id'
        }
    },
    assignedToId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'assigned_to_id',
        references: {
            model: 'users',
            key: 'id'
        }
    },
    // Review and approval
    reviewedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'reviewed_by'
    },
    reviewedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'reviewed_at'
    },
    reviewComments: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'review_comments'
    },
    rejectionReason: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'rejection_reason'
    },
    // Scheduling
    scheduledDate: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'scheduled_date'
    },
    scheduledTime: {
        type: DataTypes.TIME,
        allowNull: true,
        field: 'scheduled_time'
    },
    scheduledLocation: {
        type: DataTypes.STRING(200),
        allowNull: true,
        field: 'scheduled_location'
    },
    // Additional information
    isUrgent: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'is_urgent'
    },
    isPublic: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: 'is_public'
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'service_requests',
    hooks: {
        beforeCreate: async (serviceRequest) => {
            // Generate request number
            if (!serviceRequest.requestNumber) {
                const timestamp = Date.now();
                const random = Math.random().toString(36).substr(2, 5).toUpperCase();
                serviceRequest.requestNumber = `REQ-${timestamp}-${random}`;
            }
        }
    }
});

module.exports = ServiceRequest;
