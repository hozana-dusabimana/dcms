const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ChurchService = sequelize.define('ChurchService', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    serviceType: {
        type: DataTypes.ENUM('marriage', 'baptism', 'funeral', 'communion', 'prayer_meeting', 'bible_study', 'youth_service', 'other'),
        allowNull: false,
        field: 'service_type'
    },
    churchId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'church_id',
        references: {
            model: 'churches',
            key: 'id'
        }
    },
    scheduledDate: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'scheduled_date'
    },
    startTime: {
        type: DataTypes.TIME,
        allowNull: false,
        field: 'start_time'
    },
    endTime: {
        type: DataTypes.TIME,
        allowNull: true,
        field: 'end_time'
    },
    location: {
        type: DataTypes.STRING(200),
        allowNull: true
    },
    officiantId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'officiant_id',
        references: {
            model: 'users',
            key: 'id'
        }
    },
    status: {
        type: DataTypes.ENUM('scheduled', 'in_progress', 'completed', 'cancelled', 'postponed'),
        allowNull: false,
        defaultValue: 'scheduled'
    },
    maxAttendees: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'max_attendees'
    },
    currentAttendees: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'current_attendees'
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    isPublic: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'is_public'
    },
    createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'created_by',
        references: {
            model: 'users',
            key: 'id'
        }
    }
}, {
    tableName: 'church_services'
});

module.exports = ChurchService;



