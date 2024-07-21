const { otpGenerator, createError, createSuccess, generateToken } = require('../utils/utils');
const userModel = require('../db/models/userModel');
const bcryptJs = require('bcryptjs');
const mg = require('../utils/mg');

const OTP_EXPIRY_MS = 10 * 60 * 1000; 
const otpStorage = {};

const requestOtp = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.send(createError('Email is required'));
    }

    const otp = otpGenerator();
    otpStorage[email] = {
        otp,
        expiresAt: Date.now() + OTP_EXPIRY_MS
    };

    const data = {
        to: email,
        from: 'IndieGamies <no-reply@indiegamies.com>',
        subject: "Your OTP Code",
        html: `
            <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 10px;">
                        <h1 style="color: #4a4a4a; text-align: center;">Your OTP Code</h1>
                        <p style="font-size: 16px; text-align: center;">Here's your one-time password (OTP) for authentication:</p>
                        <div style="background-color: #e9e9e9; padding: 10px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
                            ${otp}
                        </div>
                        <p style="font-size: 14px; text-align: center; color: #777;">This OTP is valid for 10 minutes. Please do not share it with anyone.</p>
                        <p style="font-size: 14px; text-align: center; margin-top: 30px;">If you didn't request this OTP, please ignore this email.</p>
                    </div>
                </body>
            </html>
        `
    };

    try {
        await mg.messages.create('mail.indiegamies.com', data);
        res.send(createSuccess('OTP sent to your email'));
    } catch (error) {
        console.error('Error sending OTP:', error);
        res.send(createError('Error sending OTP'));
    }
};

const verifyOtp = (req, res) => {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
        return res.send(createError('Email and OTP are required'));
    }

    const storedOtpData = otpStorage[email];
    
    if (!storedOtpData) {
        return res.send(createError('OTP not found or already used'));
    }

    if (Date.now() > storedOtpData.expiresAt) {
        delete otpStorage[email];
        return res.send(createError('OTP has expired'));
    }

    if (storedOtpData.otp === otp) {
        delete otpStorage[email];
        return res.send(createSuccess('OTP verified successfully'));
    } else {
        return res.send(createError('Invalid OTP'));
    }
};

const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        let user = await userModel.findOne({ $or: [{ username }, { email }] });

        if (user) {
            return res.json(createError(user.username === username ? 'Username already exists' : 'Email already exists'));
        }

        const salt = await bcryptJs.genSalt(10);
        const encryptedPassword = await bcryptJs.hash(password, salt);

        const newUser = new userModel({
            username,
            email,
            password: encryptedPassword
        });

        const savedUser = await newUser.save();
        res.status(201).json(createSuccess(savedUser));
    } catch (error) {
        console.error('Error creating user:', error.message);
        res.status(500).json(createError('Error creating user', error.message));
    }
};

const signinUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json(createError('User not found'));
        }

        const isMatch = await bcryptJs.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json(createError('Invalid Password'));
        }

        const token = generateToken(user, '2h'); 

        res.status(200).json(createSuccess({ message: 'User signed in successfully', token }));
    } catch (error) {
        console.error('Error in signing-in user', error);
        return res.status(500).json(createError('Error signing in user', error.message));
    }
};

const cleanupExpiredOtps = () => {
    const now = Date.now();
    Object.keys(otpStorage).forEach(email => {
        if (otpStorage[email].expiresAt <= now) {
            delete otpStorage[email];
        }
    });
};

setInterval(cleanupExpiredOtps, 15 * 60 * 1000);

module.exports = {
    requestOtp,
    verifyOtp,
    registerUser,
    signinUser
};