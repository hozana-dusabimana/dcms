const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ChurchMember = sequelize.define('ChurchMember', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    firstName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'first_name'
    },
    lastName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'last_name'
    },
    email: {
        type: DataTypes.STRING(150),
        allowNull: true,
        unique: true
    },
    phone: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    dateOfBirth: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        field: 'date_of_birth'
    },
    gender: {
        type: DataTypes.ENUM('male', 'female', 'other'),
        allowNull: false
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: true
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
    membershipNumber: {
        type: DataTypes.STRING(50),
        allowNull: true,
        unique: true,
        field: 'membership_number'
    },
    membershipDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        field: 'membership_date'
    },
    membershipStatus: {
        type: DataTypes.ENUM('active', 'inactive', 'suspended', 'transferred'),
        allowNull: false,
        defaultValue: 'active',
        field: 'membership_status'
    },
    baptismDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        field: 'baptism_date'
    },
    confirmationDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        field: 'confirmation_date'
    },
    maritalStatus: {
        type: DataTypes.ENUM('single', 'married', 'divorced', 'widowed'),
        allowNull: true,
        field: 'marital_status'
    },
    occupation: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    emergencyContact: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'emergency_contact'
    },
    emergencyPhone: {
        type: DataTypes.STRING(20),
        allowNull: true,
        field: 'emergency_phone'
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'is_active'
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
    tableName: 'church_members'
});

module.exports = ChurchMember;








