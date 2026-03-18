const express = require('express');
const User = require('../models/User');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const topUsers = await User.find({ role: { $in: ['Donor', 'Receiver'] } })
            .sort({ points: -1 })
            .limit(10)
            .select('name role points badges');
        res.json(topUsers);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;
