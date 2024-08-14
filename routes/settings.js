const express = require('express');
const router = express.Router();


router.get('/settings', (req, res) => {
    res.render('base', { title: 'Settings', content: 'settings' });
});

router.post('/settings/update', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const updates = { username, email };

        if (password) {
            const salt = await bcrypt.genSalt(10);
            updates.password = await bcrypt.hash(password, salt);
        }

        await User.findByIdAndUpdate(req.session.user._id, updates);

        res.redirect('/settings');
    } catch (error) {
        console.error('Error updating user information:', error);
        res.status(500).send('Server Error');
    }
});

router.post('/settings/unlink-telegram', async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.session.user._id, { telegramId: null });
        res.redirect('/settings');
    } catch (error) {
        console.error('Error unlinking Telegram:', error);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
