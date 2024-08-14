const express = require('express');
const router = express.Router();


router.get('/settings', (req, res) => {
    res.render('base', { title: 'Settings', content: 'settings' });
});

module.exports = router;
