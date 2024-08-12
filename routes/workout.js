const express = require('express');
const router = express.Router();


router.get('/workout', (req, res) => {
    res.render('base', { title: 'Routines', content: 'workout' });
});

module.exports = router;
