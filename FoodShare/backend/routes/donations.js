const express = require('express');
const QRCode = require('qrcode');
const auth = require('../middleware/auth');
const Donation = require('../models/Donation');
const Claim = require('../models/Claim');
const User = require('../models/User');
const Notification = require('../models/Notification');

const router = express.Router();

// Create Donation (Donor only)
router.post('/', auth, async (req, res) => {
    if (req.user.role !== 'Donor') return res.status(403).json({ msg: 'Access denied' });

    try {
        const { foodName, quantity, expiryDate, address, imageUrl, pickupTimeRange } = req.body;

        let donation = new Donation({
            donorId: req.user.id,
            foodName,
            quantity,
            expiryDate,
            address,
            imageUrl,
            pickupTimeRange
        });

        // Generate QR Code containing the donation ID
        const qrData = `http://localhost:5000/api/donations/${donation._id}`;
        const qrUrl = await QRCode.toDataURL(qrData);
        donation.qrCode = qrUrl;

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
        const filters = { status: 'Pending' };
        if (req.query.foodName) filters.foodName = { $regex: req.query.foodName, $options: 'i' };
        if (req.query.address) filters.address = { $regex: req.query.address, $options: 'i' };

        const donations = await Donation.find(filters).populate('donorId', ['name', 'email']);
        res.json(donations);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Get User's specific donations
router.get('/my-donations', auth, async (req, res) => {
    try {
        const donations = await Donation.find({ donorId: req.user.id });
        res.json(donations);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Update donation status (Donor marks as Delivered)
router.put('/:id/status', auth, async (req, res) => {
    try {
        const donation = await Donation.findById(req.params.id);
        if (!donation) return res.status(404).json({ msg: 'Donation not found' });
        
        if (donation.donorId.toString() !== req.user.id && req.user.role !== 'Admin') {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        donation.status = req.body.status;
        await donation.save();
        
        // V3 GAMIFICATION LOGIC
        if (req.body.status === 'Delivered') {
            const claim = await Claim.findOne({ donationId: donation._id });
            if (claim) {
                // Award points
                const donor = await User.findById(donation.donorId);
                const receiver = await User.findById(claim.receiverId);
                
                if (donor) {
                    donor.points += 10;
                    if (donor.points >= 50 && !donor.badges.includes('Top Donor')) donor.badges.push('Top Donor');
                    await donor.save();
                    
                    const notif = new Notification({ userId: donor._id, message: `You earned 10 points for delivering "${donation.foodName}"!` });
                    await notif.save();
                }
                
                if (receiver) {
                    receiver.points += 5;
                    if (receiver.points >= 25 && !receiver.badges.includes('Frequent Receiver')) receiver.badges.push('Frequent Receiver');
                    await receiver.save();
                    
                    const notif2 = new Notification({ userId: receiver._id, message: `You earned 5 points for picking up "${donation.foodName}"!` });
                    await notif2.save();
                }
            }
        }
        
        res.json(donation);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;
