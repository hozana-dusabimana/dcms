const { sequelize } = require('../config/database');
const { ServiceComment } = require('../models');

const createServiceCommentsTable = async () => {
    try {
        console.log('Creating service_comments table...');

        // Sync the ServiceComment model to create the table
        await ServiceComment.sync({ force: true });

        console.log('✅ service_comments table created successfully');

        // Close the database connection
        await sequelize.close();
        console.log('Database connection closed');

    } catch (error) {
        console.error('❌ Error creating service_comments table:', error);
        process.exit(1);
    }
};

// Run the script
createServiceCommentsTable();



