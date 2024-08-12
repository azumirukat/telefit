const express = require('express');
const router = express.Router();


router.get('/progress', (req, res) => {
    res.render('base', { title: 'Progress Tracker', content: 'progress' });
});

module.exports = router;
