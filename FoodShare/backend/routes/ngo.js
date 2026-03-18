const express = require('express');
const auth = require('../middleware/auth');
const NgoRequest = require('../models/NgoRequest');
const Notification = require('../models/Notification');

const router = express.Router();

// Create new NGO Request (only NGO)
router.post('/', auth, async (req, res) => {
    if (req.user.role !== 'NGO') return res.status(403).json({ msg: 'Access denied' });
    try {
        const { title, quantity, schedule } = req.body;
        const request = new NgoRequest({ ngoId: req.user.id, title, quantity, schedule });
        await request.save();
        
        // Notify all donors loosely (Mock logic - emit via socket if needed)
        const io = req.app.get('io');
        if (io) io.emit('newNgoRequest', { title });

        res.json(request);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Get all open NGO Requests (Available to all)
router.get('/', async (req, res) => {
    try {
        const requests = await NgoRequest.find({ status: 'Open' }).populate('ngoId', 'name email');
        res.json(requests);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Fulfill NGO Request (Only Donors)
router.put('/:id/fulfill', auth, async (req, res) => {
    if (req.user.role !== 'Donor') return res.status(403).json({ msg: 'Access denied' });
    try {
        const request = await NgoRequest.findById(req.params.id);
        if (!request) return res.status(404).json({ msg: 'Request not found' });
        
        request.status = 'Fulfilled';
        await request.save();

        // Send a notification to the NGO
        const notif = new Notification({
            userId: request.ngoId,
            message: `Your request "${request.title}" was fulfilled by a Donor!`
        });
        await notif.save();

        res.json(request);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;
