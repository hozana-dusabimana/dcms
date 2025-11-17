const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MarriageApplication = sequelize.define('MarriageApplication', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    applicationNumber: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
        field: 'application_number'
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
    // Groom Information
    groomFirstName: {
        type: DataTypes.STRING(50),
        allowNull: false,
        field: 'groom_first_name'
    },
    groomLastName: {
        type: DataTypes.STRING(50),
        allowNull: false,
        field: 'groom_last_name'
    },
    groomDateOfBirth: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: 'groom_date_of_birth'
    },
    groomIdNumber: {
        type: DataTypes.STRING(20),
        allowNull: false,
        field: 'groom_id_number'
    },
    groomPhone: {
        type: DataTypes.STRING(20),
        allowNull: true,
        field: 'groom_phone'
    },
    groomAddress: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'groom_address'
    },
    // Bride Information
    brideFirstName: {
        type: DataTypes.STRING(50),
        allowNull: false,
        field: 'bride_first_name'
    },
    brideLastName: {
        type: DataTypes.STRING(50),
        allowNull: false,
        field: 'bride_last_name'
    },
    brideDateOfBirth: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: 'bride_date_of_birth'
    },
    brideIdNumber: {
        type: DataTypes.STRING(20),
        allowNull: false,
        field: 'bride_id_number'
    },
    bridePhone: {
        type: DataTypes.STRING(20),
        allowNull: true,
        field: 'bride_phone'
    },
    brideAddress: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'bride_address'
    },
    // Marriage Details
    marriageDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: 'marriage_date'
    },
    ceremonyType: {
        type: DataTypes.ENUM('civil', 'religious', 'both'),
        allowNull: false,
        defaultValue: 'both',
        field: 'ceremony_type'
    },
    churchId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'church_id',
        references: {
            model: 'churches',
            key: 'id'
        }
    },
    sectorId: {
        type: DataTypes.INTEGER,
        allowNull: true, // Changed to true for religious applications
        field: 'sector_id',
        references: {
            model: 'sectors',
            key: 'id'
        }
    },
    // Status and Processing
    status: {
        type: DataTypes.ENUM('pending', 'under_review', 'sector_approved', 'approved', 'rejected', 'completed', 'civil_completed'),
        allowNull: false,
        defaultValue: 'pending'
    },
    civilStatus: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        allowNull: false,
        defaultValue: 'pending',
        field: 'civil_status'
    },
    churchStatus: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        allowNull: false,
        defaultValue: 'pending',
        field: 'church_status'
    },
    civilAdminId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'civil_admin_id',
        references: {
            model: 'users',
            key: 'id'
        }
    },
    churchLeaderId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'church_leader_id',
        references: {
            model: 'users',
            key: 'id'
        }
    },
    civilComments: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'civil_comments'
    },
    churchComments: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'church_comments'
    },
    // Documents
    documents: {
        type: DataTypes.JSON,
        allowNull: true
    },
    // Timestamps
    civilReviewedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'civil_reviewed_at'
    },
    churchReviewedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'church_reviewed_at'
    },
    marriageLocation: {
        type: DataTypes.STRING(200),
        allowNull: true,
        field: 'marriage_location'
    },
    completionComments: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'completion_comments'
    },
    completedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'completed_by',
        references: {
            model: 'users',
            key: 'id'
        }
    },
    completedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'completed_at'
    },
    civilMarriageDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        field: 'civil_marriage_date'
    },
    civilMarriageLocation: {
        type: DataTypes.STRING(200),
        allowNull: true,
        field: 'civil_marriage_location'
    },
    civilCompletionComments: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'civil_completion_comments'
    },
    civilCompletedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'civil_completed_by',
        references: {
            model: 'users',
            key: 'id'
        }
    },
    civilCompletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'civil_completed_at'
    }
}, {
    tableName: 'marriage_applications'
});

module.exports = MarriageApplication;