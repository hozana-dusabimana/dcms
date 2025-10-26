const { sequelize } = require('../config/database');

async function createMemberNotificationsTable() {
    try {
        console.log('Creating member_notifications table...');

        // Create the member_notifications table
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS member_notifications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                member_id INT NOT NULL,
                title VARCHAR(200) NOT NULL,
                message TEXT NOT NULL,
                type ENUM('info', 'success', 'warning', 'error') NOT NULL DEFAULT 'info',
                is_read BOOLEAN DEFAULT FALSE,
                read_at DATETIME NULL,
                related_entity_type VARCHAR(50) NULL,
                related_entity_id INT NULL,
                action_url VARCHAR(500) NULL,
                data TEXT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (member_id) REFERENCES church_members(id) ON DELETE CASCADE
            )
        `);

        console.log('✅ Successfully created member_notifications table');

        // Insert some sample notifications
        await sequelize.query(`
            INSERT INTO member_notifications (member_id, title, message, type, created_at, updated_at)
            VALUES 
            (1, 'Welcome to DMCS MIS', 'Welcome to the DMCS Management Information System! You can now request services and stay updated with your church activities.', 'success', NOW(), NOW()),
            (1, 'Service Request Feature', 'You can now request services like baptism, confirmation, and other church ceremonies through your member portal.', 'info', NOW(), NOW())
        `);

        console.log('✅ Sample notifications inserted');

    } catch (error) {
        console.error('❌ Error creating member notifications table:', error);
    } finally {
        await sequelize.close();
    }
}

createMemberNotificationsTable();

