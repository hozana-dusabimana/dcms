const { sequelize } = require('../config/database');
const { QueryTypes } = require('sequelize');

async function addPasswordResetFields() {
    try {
        console.log('Adding password reset fields to users table...');

        // Add reset_password_token column
        await sequelize.query(`
            ALTER TABLE users 
            ADD COLUMN reset_password_token VARCHAR(255) NULL
        `, { type: QueryTypes.RAW });

        console.log('✅ Added reset_password_token column');

        // Add reset_password_expires column
        await sequelize.query(`
            ALTER TABLE users 
            ADD COLUMN reset_password_expires DATETIME NULL
        `, { type: QueryTypes.RAW });

        console.log('✅ Added reset_password_expires column');

        console.log('✅ Password reset fields added successfully!');
    } catch (error) {
        if (error.message.includes('Duplicate column name')) {
            console.log('⚠️  Password reset fields already exist in users table');
        } else {
            console.error('❌ Error adding password reset fields:', error.message);
        }
    } finally {
        await sequelize.close();
    }
}

// Run the migration
addPasswordResetFields();
