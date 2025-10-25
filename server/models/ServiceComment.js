const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ServiceComment = sequelize.define('ServiceComment', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    serviceId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'service_id',
        references: {
            model: 'church_services',
            key: 'id'
        }
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
    comment: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    commentType: {
        type: DataTypes.ENUM('general', 'concern', 'suggestion', 'cancellation_reason'),
        allowNull: false,
        defaultValue: 'general',
        field: 'comment_type'
    },
    isAnonymous: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_anonymous'
    },
    isRead: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_read'
    }
}, {
    tableName: 'service_comments'
});

module.exports = ServiceComment;

