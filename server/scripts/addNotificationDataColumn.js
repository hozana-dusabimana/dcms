const { sequelize } = require('../config/database');

async function addNotificationDataColumn() {
    try {
        console.log('Adding data column to notifications table...');

        // Add the data column to the notifications table
        await sequelize.query(`
            ALTER TABLE notifications 
            ADD COLUMN data TEXT NULL 
            AFTER action_url
        `);

        console.log('✅ Successfully added data column to notifications table');

        // Test the column by inserting a sample notification
        await sequelize.query(`
            INSERT INTO notifications (user_id, title, message, type, is_read, created_at, updated_at, data)
            VALUES (1, 'Test Notification', 'This is a test notification with data', 'info', false, NOW(), NOW(), '{"test": "data"}')
        `);

        console.log('✅ Test notification inserted successfully');

        // Clean up test data
        await sequelize.query(`
            DELETE FROM notifications WHERE title = 'Test Notification'
        `);

        console.log('✅ Test data cleaned up');

    } catch (error) {
        console.error('❌ Error adding data column:', error);
    } finally {
        await sequelize.close();
    }
}

addNotificationDataColumn();

