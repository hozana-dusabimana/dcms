const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { testConnection, syncDatabase } = require('./config/database');
const { sequelize } = require('./models');
require('dotenv').config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting - completely disabled for development
// const limiter = rateLimit({
//     windowMs: 15 * 60 * 1000, // 15 minutes
//     max: 10000, // Very high limit for development
//     message: {
//         error: 'Too many requests from this IP, please try again later.',
//         retryAfter: '15 minutes'
//     },
//     standardHeaders: true,
//     legacyHeaders: false,
//     skip: (req) => {
//         // Skip rate limiting for localhost in development
//         return req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1';
//     }
// });
// app.use('/api/', limiter);

// Database connection
const initializeDatabase = async () => {
    const connected = await testConnection();
    if (connected) {
        await syncDatabase();
    } else {
        console.log('Server will continue without database connection for testing');
    }
};

initializeDatabase();

// Socket.io for real-time features
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join-room', (userId) => {
        socket.join(`user-${userId}`);
        console.log(`User ${userId} joined their room`);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Make io accessible to routes
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/churches', require('./routes/churches'));
app.use('/api/sectors', require('./routes/sectors'));
app.use('/api/services', require('./routes/services'));
app.use('/api/certificates', require('./routes/certificates'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/certificate-requests', require('./routes/certificateRequests'));
app.use('/api/church-services', require('./routes/churchServices'));
app.use('/api/church-members', require('./routes/churchMembers'));
app.use('/api/member-auth', require('./routes/memberAuth'));
app.use('/api/service-comments', require('./routes/serviceComments'));
app.use('/api/service-requests', require('./routes/serviceRequests'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/member-notifications', require('./routes/memberNotifications'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
