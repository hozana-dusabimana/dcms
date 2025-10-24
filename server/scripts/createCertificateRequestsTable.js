const { Sequelize } = require('sequelize');

// Database connection
const sequelize = new Sequelize('dmcs_mis', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
    logging: console.log
});

async function createCertificateRequestsTable() {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connection established successfully.');

        // Create certificate_requests table
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS certificate_requests (
                id INT AUTO_INCREMENT PRIMARY KEY,
                application_id INT NOT NULL,
                user_id INT NOT NULL,
                request_number VARCHAR(50) NOT NULL UNIQUE,
                status ENUM('pending', 'paid', 'approved', 'rejected', 'issued') NOT NULL DEFAULT 'pending',
                payment_status ENUM('pending', 'paid', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
                payment_amount DECIMAL(10,2) NOT NULL DEFAULT 5000.00,
                payment_reference VARCHAR(100),
                payment_date DATETIME,
                requested_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                approved_at DATETIME,
                approved_by INT,
                issued_at DATETIME,
                issued_by INT,
                certificate_path VARCHAR(255),
                rejection_reason TEXT,
                comments TEXT,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (application_id) REFERENCES marriage_applications(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
                FOREIGN KEY (issued_by) REFERENCES users(id) ON DELETE SET NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        console.log('✅ Certificate requests table created successfully.');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await sequelize.close();
    }
}

createCertificateRequestsTable();
