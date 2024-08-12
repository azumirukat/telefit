const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const router = express.Router();
const User = require('../models/Users'); // Ensure the path to your User model is correct

// Serve the sign-up page with a Telegram login button
router.get('/signup', (req, res) => {
    res.render('base', { title: 'Sign Up', content: 'signup' });
});

// Handle Email Sign-Up (standard email registration)
router.post('/signup/email', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create and save the new user
        user = new User({
            username,
            email,
            password: hashedPassword
        });
        await user.save();

        // Store the user's ID in the session
        req.session.userId = user._id.toString();

        // Redirect to dashboard after successful registration
        console.log(req.session);
        res.redirect('/dashboard');
    } catch (error) {
        console.error('Error during sign-up:', error);
        res.status(500).send('Server Error');
    }
});

// Serve the login page with a Telegram login button
router.get('/login', (req, res) => {
    res.render('base', { title: 'Login', content: 'login' });
});

// Handle Email Login
router.post('/login/email', async (req, res) => {
    const { email, password } = req.body;
    try {
        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        // Validate the password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        // Store the user's ID in the session
        req.session.userId = user._id.toString();
        console.log(req.session);
        res.redirect('/dashboard');
    } catch (error) {
        console.error('Error during email login:', error);
        res.status(500).send('Server Error');
    }
});

// Handle Telegram OAuth callback for sign-up
router.get('/telegram/signup-callback', async (req, res) => {
    try {
        const { id, first_name, last_name, username, photo_url, auth_date, hash } = req.query;

        // Validate the Telegram callback using a secret
        const dataCheckString = Object.keys(req.query)
            .filter(key => key !== 'hash')
            .map(key => `${key}=${req.query[key]}`)
            .sort()
            .join('\n');

        const secretKey = crypto.createHash('sha256').update(process.env.TELEGRAM_BOT_TOKEN).digest();
        const computedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

        if (computedHash !== hash) {
            return res.status(403).send('Invalid Telegram authentication');
        }

        // Check if user already exists
        let user = await User.findOne({ telegramId: id });

        if (!user) {
            // Store user info in a temporary session and redirect to complete registration
            req.session.userInfo = {
                telegramId: id,
                firstName: first_name,
                lastName: last_name,
                username,
                photoUrl: photo_url
            };

            return res.redirect('/complete-registration');
        }

        // If user exists, log them in by setting the session
        req.session.userId = user._id.toString();
        console.log(req.session);
        res.redirect('/dashboard');
    } catch (error) {
        console.error('Error during Telegram sign-up:', error);
        res.status(500).send('Error during Telegram authentication');
    }
});

// Handle Telegram OAuth callback for login
router.get('/telegram/login-callback', async (req, res) => {
    try {
        const { id, hash } = req.query;

        // Validate the Telegram callback
        const dataCheckString = Object.keys(req.query)
            .filter(key => key !== 'hash')
            .map(key => `${key}=${req.query[key]}`)
            .sort()
            .join('\n');

        const secretKey = crypto.createHash('sha256').update(process.env.TELEGRAM_BOT_TOKEN).digest();
        const computedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

        if (computedHash !== hash) {
            return res.status(403).send('Invalid Telegram authentication');
        }

        // Check if user exists
        const user = await User.findOne({ telegramId: id });

        if (!user) {
            return res.status(400).send('User not found. Please sign up first.');
        }

        // Log them in by setting the session
        req.session.userId = user._id.toString();
        console.log(req.session);
        res.redirect('/dashboard');
    } catch (error) {
        console.error('Error during Telegram login:', error);
        res.status(500).send('Error during Telegram authentication');
    }
});

// Serve the email collection page for Telegram sign-up
router.get('/complete-registration', (req, res) => {
    if (!req.session.userInfo) {
        return res.redirect('/signup'); // Redirect to sign-up if session data is missing
    }
    res.render('base', { title: 'Complete Registration', content: 'complete-registration' });
});

// Handle email collection and complete registration for Telegram sign-up
router.post('/complete-registration', async (req, res) => {
    try {
        if (!req.session.userInfo) {
            console.error('User session data is missing.');
            return res.status(400).send('User session data is missing. Please try the registration process again.');
        }

        const { telegramId, firstName, lastName, username, photoUrl } = req.session.userInfo;
        const { email } = req.body;

        // Ensure the email is unique before updating
        let existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).send('Email already in use');
        }

        // Create or update the user in the database
        const user = await User.findOneAndUpdate(
            { telegramId },
            { email, firstName, lastName, username, photoUrl },
            { new: true, upsert: true } // Create if doesn't exist
        );

        // Store the user's ID in the session and clear userInfo
        req.session.userId = user._id.toString();
        delete req.session.userInfo; // Clear the temporary session data

        console.log(req.session);
        res.redirect('/dashboard');
    } catch (error) {
        console.error('Error completing registration:', error);
        res.status(500).send('Error completing registration');
    }
});

module.exports = router;
