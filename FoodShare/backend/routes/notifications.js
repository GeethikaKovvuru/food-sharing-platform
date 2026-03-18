const express = require('express');
const auth = require('../middleware/auth');
const Notification = require('../models/Notification');

const router = express.Router();

router.get('/', auth, async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .limit(20);
        res.json(notifications);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

router.put('/read-all', auth, async (req, res) => {
    try {
        await Notification.updateMany(
            { userId: req.user.id, readStatus: false },
            { $set: { readStatus: true } }
        );
        res.json({ msg: 'Notifications marked as read' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;
