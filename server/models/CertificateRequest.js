const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CertificateRequest = sequelize.define('CertificateRequest', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    applicationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'application_id',
        references: {
            model: 'marriage_applications',
            key: 'id'
        }
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'user_id',
        references: {
            model: 'users',
            key: 'id'
        }
    },
    requestNumber: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        field: 'request_number'
    },
    certificateType: {
        type: DataTypes.ENUM('sector', 'church'),
        allowNull: false,
        defaultValue: 'sector',
        field: 'certificate_type'
    },
    status: {
        type: DataTypes.ENUM('pending', 'paid', 'approved', 'issued', 'rejected'),
        allowNull: false,
        defaultValue: 'pending'
    },
    paymentStatus: {
        type: DataTypes.ENUM('pending', 'paid', 'failed'),
        allowNull: false,
        defaultValue: 'pending',
        field: 'payment_status'
    },
    paymentReference: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'payment_reference'
    },
    paymentDate: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'payment_date'
    },
    approvedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'approved_at'
    },
    approvedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'approved_by',
        references: {
            model: 'users',
            key: 'id'
        }
    },
    issuedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'issued_at'
    },
    issuedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'issued_by',
        references: {
            model: 'users',
            key: 'id'
        }
    },
    certificatePath: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: 'certificate_path'
    },
    rejectionReason: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'rejection_reason'
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'certificate_requests',
    timestamps: true
});

module.exports = CertificateRequest;