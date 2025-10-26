const nodemailer = require('nodemailer');

// Email configuration
const emailConfig = {
    service: 'gmail',
    auth: {
        user: 'lanari.rw@gmail.com',
        pass: 'ufqe oqhk twvh cpuz' // App password for Gmail
    }
};

// Create transporter
const transporter = nodemailer.createTransport(emailConfig);

// Verify connection
transporter.verify((error, success) => {
    if (error) {
        console.error('Email configuration error:', error);
    } else {
        console.log('✅ Email server is ready to send messages');
    }
});

module.exports = transporter;
