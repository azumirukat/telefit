const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('workout', { title: 'Workout Routines' });
});

module.exports = router;
