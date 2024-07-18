const jwt = require('jsonwebtoken');
const { createError } = require('../utils/utils'); 
const protectedRoutes = ['/threads/thread/new', '/replies/new'];

const authMiddleware = (req, res, next) => {
    try {
        if (!protectedRoutes.includes(req.path)) {
            return next();
        }

        const token = req.headers['authorization']?.split(' ')[1] || req.headers['token'];
        
        if (!token) {
            return res.status(401).json(createError('Authentication required. Token missing.'));
        }

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                if (err.name === 'TokenExpiredError') {
                    return res.status(401).json(createError('Token has expired. Please log in again.'));
                }
                return res.status(401).json(createError('Invalid token. Please log in again.'));
            }

            req.user = decoded;
            next();
        });
    } catch (error) {
        console.error("Authentication Error:", error.message);
        return res.status(500).json(createError('Authentication failed', error.message));
    }
};

module.exports = authMiddleware;