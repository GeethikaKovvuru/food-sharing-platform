const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Donation = require('../models/Donation');
const Claim = require('../models/Claim');

const router = express.Router();

// Middleware to check Admin role
const adminCheck = (req, res, next) => {
    if (req.user.role !== 'Admin') {
        return res.status(403).json({ msg: 'Superadmin access required' });
    }
    next();
};

// Get overview stats
router.get('/stats', auth, adminCheck, async (req, res) => {
    try {
        const totalDonors = await User.countDocuments({ role: 'Donor' });
        const totalReceivers = await User.countDocuments({ role: 'Receiver' });
        const totalPendingDonations = await Donation.countDocuments({ status: 'Pending' });
        const totalClaims = await Claim.countDocuments();

        res.json({
            users: { donors: totalDonors, receivers: totalReceivers },
            donations: { pending: totalPendingDonations, total: totalPendingDonations + totalClaims },
            claims: { total: totalClaims }
        });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Get all users
router.get('/users', auth, adminCheck, async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Get all donations
router.get('/donations', auth, adminCheck, async (req, res) => {
    try {
        const donations = await Donation.find().populate('donorId', ['name', 'email']);
        res.json(donations);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Verify a user
router.put('/users/:id/verify', auth, adminCheck, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });
        
        user.verified = !user.verified;
        await user.save();
        res.json(user);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Send notification broadcast (Mock implementation for now)
router.post('/broadcast', auth, adminCheck, async (req, res) => {
    try {
        const { message } = req.body;
        const io = req.app.get('io');
        if (io) {
            io.emit('broadcastAnnouncement', { message, timestamp: new Date() });
        }
        res.json({ msg: 'Broadcast sent successfully' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;
