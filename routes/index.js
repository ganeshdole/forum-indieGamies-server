const express = require('express');
const router = express.Router();

const authRouter = require('./auth');
const userRouter = require('./user');
const threadsRouter = require('./threads');
const categoriesRouter = require('./categories');
const repliesRouter = require('./replies');
const forgotPasswordRouter = require('./forgotPassword');

router.use('/auth', authRouter);
router.use('/user', userRouter);
router.use('/categories', categoriesRouter);
router.use('/threads', threadsRouter);
router.use('/replies', repliesRouter);
router.use('/forgot-password', forgotPasswordRouter);

module.exports = router;