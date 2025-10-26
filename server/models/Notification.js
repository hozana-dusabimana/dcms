const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Notification = sequelize.define('Notification', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
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
    title: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('info', 'success', 'warning', 'error'),
        allowNull: false,
        defaultValue: 'info'
    },
    isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'is_read'
    },
    readAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'read_at'
    },
    relatedEntityType: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'related_entity_type'
    },
    relatedEntityId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'related_entity_id'
    },
    actionUrl: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: 'action_url'
    },
    data: {
        type: DataTypes.TEXT,
        allowNull: true,
        get() {
            const value = this.getDataValue('data');
            return value ? JSON.parse(value) : null;
        },
        set(value) {
            this.setDataValue('data', value ? JSON.stringify(value) : null);
        }
    }
}, {
    tableName: 'notifications'
});

module.exports = Notification;