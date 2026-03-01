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
            donation_id: donation._id,
            receiver_id: req.user.id
        });
        await claim.save();

        res.json({ msg: 'Food claimed successfully', claim });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
