const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('progress', { title: 'Progress' });
});

module.exports = router;
