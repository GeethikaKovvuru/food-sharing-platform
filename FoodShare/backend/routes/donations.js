const express = require('express');
const QRCode = require('qrcode');
const auth = require('../middleware/auth');
const Donation = require('../models/Donation');

const router = express.Router();

// Create Donation (Donor only)
router.post('/', auth, async (req, res) => {
    if (req.user.role !== 'Donor') return res.status(403).json({ msg: 'Access denied' });

    try {
        const { food_name, quantity, expiry_date, address, image_url } = req.body;

        let donation = new Donation({
            donor_id: req.user.id,
            food_name,
            quantity,
            expiry_date,
            address,
            image_url
        });

        // Generate QR Code containing the donation ID
        const qrData = `http://localhost:5000/api/donations/${donation._id}`;
        const qrUrl = await QRCode.toDataURL(qrData);
        donation.qr_code = qrUrl;

        await donation.save();
        res.json(donation);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Get all donations (Receivers, Admins)
router.get('/', async (req, res) => {
    try {
        const donations = await Donation.find({ status: 'Pending' }).populate('donor_id', ['name', 'email']);
        res.json(donations);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Get User's specific donations
router.get('/my-donations', auth, async (req, res) => {
    try {
        const donations = await Donation.find({ donor_id: req.user.id });
        res.json(donations);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;
