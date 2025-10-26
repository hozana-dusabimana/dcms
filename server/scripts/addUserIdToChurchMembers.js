const { sequelize } = require('../config/database');

async function addUserIdToChurchMembers() {
    try {
        console.log('Adding user_id column to church_members table...');

        // Add the user_id column to the church_members table
        await sequelize.query(`
            ALTER TABLE church_members 
            ADD COLUMN user_id INT NULL 
            AFTER id,
            ADD CONSTRAINT fk_church_members_user_id 
            FOREIGN KEY (user_id) REFERENCES users(id) 
            ON DELETE SET NULL ON UPDATE CASCADE
        `);

        console.log('✅ Successfully added user_id column to church_members table');

    } catch (error) {
        if (error.message.includes('Duplicate column name')) {
            console.log('✅ user_id column already exists in church_members table');
        } else {
            console.error('❌ Error adding user_id column:', error);
        }
    } finally {
        await sequelize.close();
    }
}

addUserIdToChurchMembers();

