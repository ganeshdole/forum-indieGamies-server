const express = require('express')
const router = express.Router();
const {requestOtp, verifyOtp } =  require("../controllers/forgotPasswordController")

router.post("request-otp", requestOtp)
router.post("verify-otp", verifyOtp)