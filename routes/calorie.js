const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('calorie-calculator', { title: 'Calorie Counter' });
});

router.post('/upload', (req, res) => {
    // Handle image upload and analysis here
    res.json({ success: true, data: 'dummyData' });
});

module.exports = router;
