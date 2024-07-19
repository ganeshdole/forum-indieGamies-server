const OTP_EXPIRY_MS = 5 * 60 * 1000; 
const {generateToken} = require("../utils/utils")
const userModel = require("../db/models/userModel")
const {createError, createSuccess} = require("../utils/utils")
const otpStorage = {};
const {otpGenerator} = require("../utils/utils")
const mg = require("../utils/mg")


const requestOtp = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.send(createError('Email is required'));
    }

    let user = await userModel.findOne({ email });  
    if (!user) {
        return res.send(createError('User not found'));
    }

    const otp = otpGenerator();
    otpStorage[email] = {
        otp,
        expiresAt: Date.now() + OTP_EXPIRY_MS
    };

    setTimeout(() => {
        if (otpStorage[email]) {
            delete otpStorage[email];
        }
    }, OTP_EXPIRY_MS);

    const data = {
        to : email,
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
                        <p style="font-size: 14px; text-align: center; color: #777;">This OTP is valid for a limited time. Please do not share it with anyone.</p>
                        <p style="font-size: 14px; text-align: center; margin-top: 30px;">If you didn't request this OTP, please ignore this email.</p>
                    </div>
                </body>
            </html>
        `
    };

    try {
        const msg = await mg.messages.create('mail.indiegamies.com', data);
        res.send(createSuccess('OTP sent to your email'));
    } catch (error) {
        if (otpStorage[email]) {
            clearTimeout(otpStorage[email].timeoutId);
            delete otpStorage[email];
        }
        console.error('Error sending OTP:', error);
        res.send(createError(error));
    }
};


const verifyOtp = async (req, res) =>{
    console.log( req.body )
    const { email, otp } = req.body;
    

    const storedOTPData = otpStorage[email];
    console.log(storedOTPData);
    if(!storedOTPData){
        res.send(createError('OTP expired'));
    }

    if (Date.now() > storedOTPData?.expiresAt) {
        delete otpStorage[email];
        return res.send(createError('OTP has expired'));
    }
    
    if(storedOTPData.otp !== otp){
        res.send(createError('Invalid OTP'));
    }
    
    try {
        delete otpStorage[email];
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json(createError('User not found'));
        }
        
        const token = generateToken(user, '10m'); 
        res.status(200).json(createSuccess({ message: 'OTP verified successfully', token }));
    } catch (error) {
        console.error('Error in verifyOtp:', error);
        res.status(500).json(createError('Error verifying OTP'));
    }
}

const cleanupExpiredOtps = () => {
    const now = Date.now();
    Object.keys(otpStorage).forEach(email => {
        if (otpStorage[email].expiresAt <= now) {
            delete otpStorage[email];
        }
    });
};

setInterval(cleanupExpiredOtps, 10 * 60 * 1000);

module.exports = {
    requestOtp,
    verifyOtp
}