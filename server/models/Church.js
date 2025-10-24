const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Church = sequelize.define('Church', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    denomination: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    location: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    phone: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: true,
        validate: {
            isEmail: true
        }
    },
    leaderName: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'leader_name'
    },
    leaderPhone: {
        type: DataTypes.STRING(20),
        allowNull: true,
        field: 'leader_phone'
    },
    leaderEmail: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'leader_email',
        validate: {
            isEmail: true
        }
    },
    sectorId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'sector_id',
        references: {
            model: 'sectors',
            key: 'id'
        }
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: 'is_active'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'churches'
});

module.exports = Church;