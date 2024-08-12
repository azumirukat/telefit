const express = require('express');
const router = express.Router();

router.get('/calorie', (req, res) => {
    res.render('base', { title: 'Calorie Calculator', content: 'calorie-calculator' });
});


router.post('/upload', (req, res) => {
    // Handle image upload and analysis here
    res.json({ success: true, data: 'dummyData' });
});

module.exports = router;
