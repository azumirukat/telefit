const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('bmi-calculator', { title: 'BMI Calculator' });
});

router.post('/calculate', (req, res) => {
    const { height, weight } = req.body;
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    res.json({ bmi: bmi.toFixed(2) });
});

module.exports = router;
