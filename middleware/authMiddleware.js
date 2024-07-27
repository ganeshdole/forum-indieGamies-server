const jwt = require('jsonwebtoken');
const { createError } = require('../utils/utils'); 
const protectedRoutes = [
    { path: '/api/threads/thread/new', exact: true },
    { path: '/api/replies/new', exact: true },
    { path: '/api/user/update', exact: true },
    { path: '/api/replies/delete', exact: false }  ,
    { path: '/api/threads/delete', exact: false }  
  ];

const authMiddleware = (req, res, next) => {
    try {
        const isProtected = protectedRoutes.some(route => {
            if (route.exact) {
                return req.path === route.path;
            } else {
                return req.path.startsWith(route.path);
            }
        });

        if (!isProtected) {
            return next();
        }

        console.log(req.headers)
        const token = req.headers['token'];
        console.log(token)
        if (!token) {
            return res.status(401).json(createError('Authentication required. Token missing.'));
        }
        try{
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            console.log(req.user)
            next();
        }catch(error){
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json(createError('Token has expired. Please log in again.'));
            }
            return res.status(401).json(createError('Invalid token. Please log in again.'));
        }
    } catch (error) {
        console.error("Authentication Error:", error.message);
        return res.status(500).json(createError('Authentication failed', error.message));
    }
};

module.exports = authMiddleware;