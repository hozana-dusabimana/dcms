#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up DMCS MIS - React & Node.js Project');
console.log('================================================\n');

// Check if Node.js is installed
try {
    const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
    console.log(`✅ Node.js version: ${nodeVersion}`);
} catch (error) {
    console.error('❌ Node.js is not installed. Please install Node.js first.');
    process.exit(1);
}

// Check if npm is installed
try {
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    console.log(`✅ npm version: ${npmVersion}\n`);
} catch (error) {
    console.error('❌ npm is not installed. Please install npm first.');
    process.exit(1);
}

// Install root dependencies
console.log('📦 Installing root dependencies...');
try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Root dependencies installed\n');
} catch (error) {
    console.error('❌ Failed to install root dependencies');
    process.exit(1);
}

// Install server dependencies
console.log('📦 Installing server dependencies...');
try {
    execSync('cd server && npm install', { stdio: 'inherit' });
    console.log('✅ Server dependencies installed\n');
} catch (error) {
    console.error('❌ Failed to install server dependencies');
    process.exit(1);
}

// Install client dependencies
console.log('📦 Installing client dependencies...');
try {
    execSync('cd client && npm install', { stdio: 'inherit' });
    console.log('✅ Client dependencies installed\n');
} catch (error) {
    console.error('❌ Failed to install client dependencies');
    process.exit(1);
}

// Create .env file if it doesn't exist
const envPath = path.join(__dirname, 'server', '.env');
const envExamplePath = path.join(__dirname, 'server', 'env.example');

if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
    console.log('📝 Creating .env file...');
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ .env file created from template\n');
}

// Create uploads directory
const uploadsPath = path.join(__dirname, 'server', 'uploads');
if (!fs.existsSync(uploadsPath)) {
    console.log('📁 Creating uploads directory...');
    fs.mkdirSync(uploadsPath, { recursive: true });
    console.log('✅ Uploads directory created\n');
}

console.log('🎉 Setup completed successfully!');
console.log('\n📋 Next steps:');
console.log('1. Update server/.env with your database credentials');
console.log('2. Run: npm run dev (to start both frontend and backend)');
console.log('3. Or run separately:');
console.log('- npm run server: Start backend only');
console.log('- npm run client: Start frontend only');
console.log('- npm run build: Build for production');
console.log('- npm start: Start production server');
console.log('\n📚 Documentation: See README.md for detailed information');