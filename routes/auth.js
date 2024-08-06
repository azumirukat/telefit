const express = require('express');
const router = express.Router();
const crypto = require('crypto');

// Serve the sign-up page
router.get('/signup', (req, res) => {
    res.render('base', { title: 'Sign Up', content: 'signup' });
});

// Serve the login page
router.get('/login', (req, res) => {
    res.render('login', { title: 'Login' });
});

// Handle Telegram OAuth callback
router.get('/telegram', async (req, res) => {
    try {
        const { query } = req;
        const { id, first_name, last_name, username, hash } = query;

        // Validate the Telegram callback
        const dataCheck = `auth_date=${query.auth_date}\nfirst_name=${first_name}\nlast_name=${last_name}\nusername=${username}\nid=${id}`;
        const secret = crypto.createHash('sha256').update(process.env.TELEGRAM_APP_HASH).digest();
        const computedHash = crypto.createHmac('sha256', secret).update(dataCheck).digest('hex');

        if (computedHash !== hash) {
            return res.status(403).send('Invalid Telegram authentication');
        }

        res.redirect('/dashboard');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error during authentication');
    }
});

// Handle Email Sign-Up
router.post('/signup/email', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        // Implement logic to handle email sign-up
        res.redirect('/dashboard');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error during sign-up');
    }
});

// Handle Email Login
router.post('/login/email', async (req, res) => {
    try {
        const { email, password } = req.body;
        // Implement logic to handle email login
        res.redirect('/dashboard');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error during login');
    }
});

module.exports = router;
