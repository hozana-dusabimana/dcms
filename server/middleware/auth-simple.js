const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    console.log('Auth middleware called');

    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.userId = decoded.userId;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ message: 'Token is not valid' });
    }
};

const authorize = (...roles) => {
    return async (req, res, next) => {
        try {
            console.log('Authorize middleware called');

            if (!req.userId) {
                return res.status(401).json({ message: 'No user ID found' });
            }

            const User = require('../models/User');
            const user = await User.findByPk(req.userId);

            if (!user) {
                return res.status(401).json({ message: 'User not found' });
            }

            if (!roles.includes(user.userType)) {
                return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
            }

            req.user = user;
            next();
        } catch (error) {
            console.error('Authorize middleware error:', error);
            res.status(500).json({ message: 'Server error in authorization' });
        }
    };
};

const memberAuth = (req, res, next) => {
    console.log('Member auth middleware called');

    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.memberId = decoded.memberId;
        next();
    } catch (error) {
        console.error('Member auth middleware error:', error);
        res.status(401).json({ message: 'Token is not valid' });
    }
};

module.exports = { auth, authorize, memberAuth };
