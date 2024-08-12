const express = require('express');
const router = express.Router();

router.get('/bmi', (req, res) => {
    res.render('base', { title: 'BMI Calculator', content: 'bmi-calculator' });
});

router.post('/calculate', (req, res) => {
    const { height, weight } = req.body;
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    res.json({ bmi: bmi.toFixed(2) });
});

module.exports = router;
