const express = require('express');
const auth = require('../middleware/auth');
const Claim = require('../models/Claim');
const Donation = require('../models/Donation');

const router = express.Router();

// Claim a donation (Receiver only)
router.post('/:id', auth, async (req, res) => {
    if (req.user.role !== 'Receiver') return res.status(403).json({ msg: 'Access denied' });

    try {
        const donation = await Donation.findById(req.params.id);
        if (!donation) return res.status(404).json({ msg: 'Donation not found' });
        if (donation.status !== 'Pending') return res.status(400).json({ msg: 'Donation already claimed or delivered' });

        donation.status = 'Claimed';
        await donation.save();

        const claim = new Claim({
            donationId: donation._id,
            receiverId: req.user.id,
            selectedPickupTime: req.body.selectedPickupTime
        });
        await claim.save();

        // Socket.io notification emission could go here, handled by req.app
        const io = req.app.get('io');
        if (io) {
            io.to(donation.donorId.toString()).emit('donationClaimed', {
                message: `Your donation "${donation.foodName}" has been claimed!`,
                donationId: donation._id
            });
        }

        res.json({ msg: 'Food claimed successfully', claim });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Get User's claims
router.get('/my-claims', auth, async (req, res) => {
    try {
        const claims = await Claim.find({ receiverId: req.user.id }).populate('donationId');
        res.json(claims);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;
