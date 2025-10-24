const { sequelize } = require('../config/database');
const { ChurchMember, Church, User } = require('../models');

const seedMemberData = async () => {
    try {
        console.log('Seeding member data...');

        // Find the first church and user
        const church = await Church.findOne();
        const user = await User.findOne();

        if (!church || !user) {
            console.log('❌ No church or user found. Please create a church and user first.');
            return;
        }

        // Create sample church members
        const members = [
            {
                firstName: 'John',
                lastName: 'Doe',
                phone: '+1234567890',
                email: 'john.doe@example.com',
                gender: 'male',
                churchId: church.id,
                membershipNumber: 'MEM001',
                membershipStatus: 'active',
                createdBy: user.id
            },
            {
                firstName: 'Jane',
                lastName: 'Smith',
                phone: '+1234567891',
                email: 'jane.smith@example.com',
                gender: 'female',
                churchId: church.id,
                membershipNumber: 'MEM002',
                membershipStatus: 'active',
                createdBy: user.id
            },
            {
                firstName: 'Mike',
                lastName: 'Johnson',
                phone: '+1234567892',
                email: 'mike.johnson@example.com',
                gender: 'male',
                churchId: church.id,
                membershipNumber: 'MEM003',
                membershipStatus: 'active',
                createdBy: user.id
            }
        ];

        for (const memberData of members) {
            const existingMember = await ChurchMember.findOne({
                where: { phone: memberData.phone }
            });

            if (!existingMember) {
                await ChurchMember.create(memberData);
                console.log(`✅ Created member: ${memberData.firstName} ${memberData.lastName} (${memberData.phone})`);
            } else {
                console.log(`⚠️  Member already exists: ${memberData.firstName} ${memberData.lastName} (${memberData.phone})`);
            }
        }

        console.log('✅ Member data seeding completed');

        // Close the database connection
        await sequelize.close();
        console.log('Database connection closed');

    } catch (error) {
        console.error('❌ Error seeding member data:', error);
        process.exit(1);
    }
};

// Run the script
seedMemberData();
