const { sequelize } = require('../config/database');
const Church = require('../models/Church');
const Sector = require('../models/Sector');

const seedData = async () => {
    try {
        console.log('🌱 Starting to seed sample data...');

        // Sample Sectors
        const sectors = [
            {
                name: 'Central District',
                code: 'CD001',
                district: 'Kigali',
                province: 'Kigali City',
                address: 'Central Business District, Kigali',
                phone: '+250 788 123 456',
                email: 'central@civil.gov.rw',
                isActive: true
            },
            {
                name: 'North District',
                code: 'ND001',
                district: 'Musanze',
                province: 'Northern Province',
                address: 'Musanze Town Center',
                phone: '+250 788 234 567',
                email: 'north@civil.gov.rw',
                isActive: true
            },
            {
                name: 'South District',
                code: 'SD001',
                district: 'Huye',
                province: 'Southern Province',
                address: 'Huye Town Center',
                phone: '+250 788 345 678',
                email: 'south@civil.gov.rw',
                isActive: true
            },
            {
                name: 'East District',
                code: 'ED001',
                district: 'Rwamagana',
                province: 'Eastern Province',
                address: 'Rwamagana Town Center',
                phone: '+250 788 456 789',
                email: 'east@civil.gov.rw',
                isActive: true
            },
            {
                name: 'West District',
                code: 'WD001',
                district: 'Rubavu',
                province: 'Western Province',
                address: 'Rubavu Town Center',
                phone: '+250 788 567 890',
                email: 'west@civil.gov.rw',
                isActive: true
            }
        ];

        // Sample Churches
        const churches = [
            {
                name: 'St. Mary Catholic Church',
                denomination: 'Catholic',
                address: 'Kimisagara, Kigali',
                location: 'Kigali',
                phone: '+250 788 111 111',
                email: 'stmary@church.rw',
                leaderName: 'Rev. Father Jean Baptiste',
                leaderPhone: '+250 788 111 112',
                leaderEmail: 'jean.baptiste@church.rw',
                description: 'A beautiful Catholic church serving the Kimisagara community',
                isActive: true
            },
            {
                name: 'St. Paul Anglican Church',
                denomination: 'Anglican',
                address: 'Nyamirambo, Kigali',
                location: 'Kigali',
                phone: '+250 788 222 222',
                email: 'stpaul@anglican.rw',
                leaderName: 'Rev. Canon Peter Mugisha',
                leaderPhone: '+250 788 222 223',
                leaderEmail: 'peter.mugisha@anglican.rw',
                description: 'Historic Anglican church in Nyamirambo',
                isActive: true
            },
            {
                name: 'Kigali Baptist Church',
                denomination: 'Baptist',
                address: 'Kacyiru, Kigali',
                location: 'Kigali',
                phone: '+250 788 333 333',
                email: 'kigali@baptist.rw',
                leaderName: 'Pastor David Nkurunziza',
                leaderPhone: '+250 788 333 334',
                leaderEmail: 'david.nkurunziza@baptist.rw',
                description: 'Modern Baptist church in Kacyiru',
                isActive: true
            },
            {
                name: 'Musanze Presbyterian Church',
                denomination: 'Presbyterian',
                address: 'Musanze Town Center',
                location: 'Musanze',
                phone: '+250 788 444 444',
                email: 'musanze@presbyterian.rw',
                leaderName: 'Rev. Dr. Samuel Mukamana',
                leaderPhone: '+250 788 444 445',
                leaderEmail: 'samuel.mukamana@presbyterian.rw',
                description: 'Presbyterian church serving the Musanze community',
                isActive: true
            },
            {
                name: 'Huye Methodist Church',
                denomination: 'Methodist',
                address: 'Huye Town Center',
                location: 'Huye',
                phone: '+250 788 555 555',
                email: 'huye@methodist.rw',
                leaderName: 'Rev. Grace Uwimana',
                leaderPhone: '+250 788 555 556',
                leaderEmail: 'grace.uwimana@methodist.rw',
                description: 'Methodist church in Huye',
                isActive: true
            },
            {
                name: 'Rwamagana Pentecostal Church',
                denomination: 'Pentecostal',
                address: 'Rwamagana Town Center',
                location: 'Rwamagana',
                phone: '+250 788 666 666',
                email: 'rwamagana@pentecostal.rw',
                leaderName: 'Pastor Emmanuel Niyonshuti',
                leaderPhone: '+250 788 666 667',
                leaderEmail: 'emmanuel.niyonshuti@pentecostal.rw',
                description: 'Pentecostal church in Rwamagana',
                isActive: true
            },
            {
                name: 'Rubavu Seventh-day Adventist Church',
                denomination: 'Seventh-day Adventist',
                address: 'Rubavu Town Center',
                location: 'Rubavu',
                phone: '+250 788 777 777',
                email: 'rubavu@adventist.rw',
                leaderName: 'Pastor John Bosco',
                leaderPhone: '+250 788 777 778',
                leaderEmail: 'john.bosco@adventist.rw',
                description: 'Seventh-day Adventist church in Rubavu',
                isActive: true
            }
        ];

        // Clear existing data
        console.log('🗑️  Clearing existing data...');
        await Church.destroy({ where: {} });
        await Sector.destroy({ where: {} });

        // Insert sectors first (churches reference sectors)
        console.log('🏛️  Inserting sectors...');
        const createdSectors = await Sector.bulkCreate(sectors);
        console.log(`✅ Created ${createdSectors.length} sectors`);

        // Assign sectors to churches
        churches[0].sectorId = createdSectors[0].id; // Central District
        churches[1].sectorId = createdSectors[0].id; // Central District
        churches[2].sectorId = createdSectors[0].id; // Central District
        churches[3].sectorId = createdSectors[1].id; // North District
        churches[4].sectorId = createdSectors[2].id; // South District
        churches[5].sectorId = createdSectors[3].id; // East District
        churches[6].sectorId = createdSectors[4].id; // West District

        // Insert churches
        console.log('⛪ Inserting churches...');
        const createdChurches = await Church.bulkCreate(churches);
        console.log(`✅ Created ${createdChurches.length} churches`);

        console.log('🎉 Sample data seeded successfully!');
        console.log('\n📊 Summary:');
        console.log(`   - ${createdSectors.length} Sectors created`);
        console.log(`   - ${createdChurches.length} Churches created`);

        console.log('\n🏛️  Sectors:');
        createdSectors.forEach(sector => {
            console.log(`   - ${sector.name} (${sector.code}) - ${sector.district}`);
        });

        console.log('\n⛪ Churches:');
        createdChurches.forEach(church => {
            console.log(`   - ${church.name} (${church.denomination}) - ${church.location}`);
        });

    } catch (error) {
        console.error('❌ Error seeding data:', error);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
};

// Run the seed function
seedData();
const Church = require('../models/Church');
const Sector = require('../models/Sector');

const seedData = async () => {
    try {
        console.log('🌱 Starting to seed sample data...');

        // Sample Sectors
        const sectors = [
            {
                name: 'Central District',
                code: 'CD001',
                district: 'Kigali',
                province: 'Kigali City',
                address: 'Central Business District, Kigali',
                phone: '+250 788 123 456',
                email: 'central@civil.gov.rw',
                isActive: true
            },
            {
                name: 'North District',
                code: 'ND001',
                district: 'Musanze',
                province: 'Northern Province',
                address: 'Musanze Town Center',
                phone: '+250 788 234 567',
                email: 'north@civil.gov.rw',
                isActive: true
            },
            {
                name: 'South District',
                code: 'SD001',
                district: 'Huye',
                province: 'Southern Province',
                address: 'Huye Town Center',
                phone: '+250 788 345 678',
                email: 'south@civil.gov.rw',
                isActive: true
            },
            {
                name: 'East District',
                code: 'ED001',
                district: 'Rwamagana',
                province: 'Eastern Province',
                address: 'Rwamagana Town Center',
                phone: '+250 788 456 789',
                email: 'east@civil.gov.rw',
                isActive: true
            },
            {
                name: 'West District',
                code: 'WD001',
                district: 'Rubavu',
                province: 'Western Province',
                address: 'Rubavu Town Center',
                phone: '+250 788 567 890',
                email: 'west@civil.gov.rw',
                isActive: true
            }
        ];

        // Sample Churches
        const churches = [
            {
                name: 'St. Mary Catholic Church',
                denomination: 'Catholic',
                address: 'Kimisagara, Kigali',
                location: 'Kigali',
                phone: '+250 788 111 111',
                email: 'stmary@church.rw',
                leaderName: 'Rev. Father Jean Baptiste',
                leaderPhone: '+250 788 111 112',
                leaderEmail: 'jean.baptiste@church.rw',
                description: 'A beautiful Catholic church serving the Kimisagara community',
                isActive: true
            },
            {
                name: 'St. Paul Anglican Church',
                denomination: 'Anglican',
                address: 'Nyamirambo, Kigali',
                location: 'Kigali',
                phone: '+250 788 222 222',
                email: 'stpaul@anglican.rw',
                leaderName: 'Rev. Canon Peter Mugisha',
                leaderPhone: '+250 788 222 223',
                leaderEmail: 'peter.mugisha@anglican.rw',
                description: 'Historic Anglican church in Nyamirambo',
                isActive: true
            },
            {
                name: 'Kigali Baptist Church',
                denomination: 'Baptist',
                address: 'Kacyiru, Kigali',
                location: 'Kigali',
                phone: '+250 788 333 333',
                email: 'kigali@baptist.rw',
                leaderName: 'Pastor David Nkurunziza',
                leaderPhone: '+250 788 333 334',
                leaderEmail: 'david.nkurunziza@baptist.rw',
                description: 'Modern Baptist church in Kacyiru',
                isActive: true
            },
            {
                name: 'Musanze Presbyterian Church',
                denomination: 'Presbyterian',
                address: 'Musanze Town Center',
                location: 'Musanze',
                phone: '+250 788 444 444',
                email: 'musanze@presbyterian.rw',
                leaderName: 'Rev. Dr. Samuel Mukamana',
                leaderPhone: '+250 788 444 445',
                leaderEmail: 'samuel.mukamana@presbyterian.rw',
                description: 'Presbyterian church serving the Musanze community',
                isActive: true
            },
            {
                name: 'Huye Methodist Church',
                denomination: 'Methodist',
                address: 'Huye Town Center',
                location: 'Huye',
                phone: '+250 788 555 555',
                email: 'huye@methodist.rw',
                leaderName: 'Rev. Grace Uwimana',
                leaderPhone: '+250 788 555 556',
                leaderEmail: 'grace.uwimana@methodist.rw',
                description: 'Methodist church in Huye',
                isActive: true
            },
            {
                name: 'Rwamagana Pentecostal Church',
                denomination: 'Pentecostal',
                address: 'Rwamagana Town Center',
                location: 'Rwamagana',
                phone: '+250 788 666 666',
                email: 'rwamagana@pentecostal.rw',
                leaderName: 'Pastor Emmanuel Niyonshuti',
                leaderPhone: '+250 788 666 667',
                leaderEmail: 'emmanuel.niyonshuti@pentecostal.rw',
                description: 'Pentecostal church in Rwamagana',
                isActive: true
            },
            {
                name: 'Rubavu Seventh-day Adventist Church',
                denomination: 'Seventh-day Adventist',
                address: 'Rubavu Town Center',
                location: 'Rubavu',
                phone: '+250 788 777 777',
                email: 'rubavu@adventist.rw',
                leaderName: 'Pastor John Bosco',
                leaderPhone: '+250 788 777 778',
                leaderEmail: 'john.bosco@adventist.rw',
                description: 'Seventh-day Adventist church in Rubavu',
                isActive: true
            }
        ];

        // Clear existing data
        console.log('🗑️  Clearing existing data...');
        await Church.destroy({ where: {} });
        await Sector.destroy({ where: {} });

        // Insert sectors first (churches reference sectors)
        console.log('🏛️  Inserting sectors...');
        const createdSectors = await Sector.bulkCreate(sectors);
        console.log(`✅ Created ${createdSectors.length} sectors`);

        // Assign sectors to churches
        churches[0].sectorId = createdSectors[0].id; // Central District
        churches[1].sectorId = createdSectors[0].id; // Central District
        churches[2].sectorId = createdSectors[0].id; // Central District
        churches[3].sectorId = createdSectors[1].id; // North District
        churches[4].sectorId = createdSectors[2].id; // South District
        churches[5].sectorId = createdSectors[3].id; // East District
        churches[6].sectorId = createdSectors[4].id; // West District

        // Insert churches
        console.log('⛪ Inserting churches...');
        const createdChurches = await Church.bulkCreate(churches);
        console.log(`✅ Created ${createdChurches.length} churches`);

        console.log('🎉 Sample data seeded successfully!');
        console.log('\n📊 Summary:');
        console.log(`   - ${createdSectors.length} Sectors created`);
        console.log(`   - ${createdChurches.length} Churches created`);

        console.log('\n🏛️  Sectors:');
        createdSectors.forEach(sector => {
            console.log(`   - ${sector.name} (${sector.code}) - ${sector.district}`);
        });

        console.log('\n⛪ Churches:');
        createdChurches.forEach(church => {
            console.log(`   - ${church.name} (${church.denomination}) - ${church.location}`);
        });

    } catch (error) {
        console.error('❌ Error seeding data:', error);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
};

// Run the seed function
seedData();
