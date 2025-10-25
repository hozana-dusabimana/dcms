const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Document = sequelize.define('Document', {
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
    originalName: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'original_name'
    },
    filename: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    filePath: {
        type: DataTypes.STRING(500),
        allowNull: false,
        field: 'file_path'
    },
    fileSize: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'file_size'
    },
    mimeType: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'mime_type'
    },
    category: {
        type: DataTypes.ENUM('birth_certificate', 'id_card', 'baptism_certificate', 'divorce_certificate', 'death_certificate', 'marriage_certificate', 'other'),
        allowNull: false,
        defaultValue: 'other'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    isPublic: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'is_public'
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
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: 'is_active'
    }
}, {
    tableName: 'documents',
    timestamps: true
});

module.exports = Document;

