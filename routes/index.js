const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('base', { title: 'Home', content: 'index'});

    
});

module.exports = router;
