const crypto = require('crypto');
const jwt = require('jsonwebtoken');

function otpGenerator() {
    return crypto.randomBytes(3).toString('hex').toUpperCase();
}

function createSuccess(data) {
    return {
        status: 'success',
        data
    }
}

function createError(error) {
    return {
        status: "error",
        error: error
    }
}

function generateToken(user, expiresTime = null) {
    return jwt.sign(
        { id: user._id, username: user.username, email: user.email },
        process.env.JWT_SECRET, 
        { expiresIn: expiresTime }
    );
}

const OTP_EXPIRY_MS = 10 * 60 * 1000; 

module.exports = {
    createError,
    createSuccess,
    otpGenerator,
    generateToken,
    OTP_EXPIRY_MS
}