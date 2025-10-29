const { sequelize } = require('../config/database');
const { DataTypes } = require('sequelize');

const createServiceRequestsTable = async () => {
    try {
        console.log('Creating service_requests table...');

        // Define the service_requests table structure
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS service_requests (
                id INT AUTO_INCREMENT PRIMARY KEY,
                request_number VARCHAR(50) NOT NULL UNIQUE,
                member_id INT NOT NULL,
                service_type ENUM('baptism', 'marriage', 'funeral', 'communion', 'confirmation', 'dedication', 'other') NOT NULL,
                title VARCHAR(200) NOT NULL,
                description TEXT,
                requested_date DATE,
                preferred_time TIME,
                location VARCHAR(200),
                status ENUM('pending', 'under_review', 'approved', 'scheduled', 'completed', 'rejected', 'cancelled') NOT NULL DEFAULT 'pending',
                priority ENUM('low', 'medium', 'high', 'urgent') NOT NULL DEFAULT 'medium',
                special_requirements TEXT,
                contact_phone VARCHAR(20),
                contact_email VARCHAR(100),
                estimated_attendees INT,
                related_service_id INT,
                assigned_to_id INT,
                reviewed_by INT,
                reviewed_at DATETIME,
                review_comments TEXT,
                rejection_reason TEXT,
                scheduled_date DATETIME,
                scheduled_time TIME,
                scheduled_location VARCHAR(200),
                is_urgent BOOLEAN DEFAULT FALSE,
                is_public BOOLEAN DEFAULT TRUE,
                notes TEXT,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                
                FOREIGN KEY (member_id) REFERENCES church_members(id) ON DELETE CASCADE,
                FOREIGN KEY (related_service_id) REFERENCES church_services(id) ON DELETE SET NULL,
                FOREIGN KEY (assigned_to_id) REFERENCES users(id) ON DELETE SET NULL,
                FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
                
                INDEX idx_member_id (member_id),
                INDEX idx_service_type (service_type),
                INDEX idx_status (status),
                INDEX idx_requested_date (requested_date),
                INDEX idx_created_at (created_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
        `);

        console.log('✅ service_requests table created successfully');

        // Insert sample data
        await sequelize.query(`
            INSERT INTO service_requests (
                request_number, member_id, service_type, title, description, 
                requested_date, preferred_time, location, status, priority,
                special_requirements, contact_phone, estimated_attendees, is_urgent
            ) VALUES 
            (
                'REQ-1737624000000-ABC12', 1, 'baptism', 'Baptism Service Request', 
                'I would like to request a baptism service for my child who is turning 3 years old.',
                '2025-12-15', '10:00:00', 'Main Church Hall', 'pending', 'medium',
                'Need wheelchair accessibility', '0781234567', 25, false
            ),
            (
                'REQ-1737624000001-DEF34', 2, 'marriage', 'Wedding Ceremony Request',
                'We would like to have our wedding ceremony at the church. Both of us are active members.',
                '2025-12-20', '14:00:00', 'Main Church Hall', 'under_review', 'high',
                'Need special music arrangements', '0787654321', 150, false
            ),
            (
                'REQ-1737624000002-GHI56', 3, 'funeral', 'Funeral Service Request',
                'Requesting funeral service for my late father who was a long-time member.',
                '2025-12-10', '09:00:00', 'Main Church Hall', 'approved', 'urgent',
                'Family from out of town will attend', '0789998888', 80, true
            );
        `);

        console.log('✅ Sample service request data inserted');

    } catch (error) {
        console.error('❌ Error creating service_requests table:', error);
        throw error;
    }
};

// Run the migration if this file is executed directly
if (require.main === module) {
    createServiceRequestsTable()
        .then(() => {
            console.log('Service requests table migration completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Migration failed:', error);
            process.exit(1);
        });
}

module.exports = createServiceRequestsTable;






