const express = require('express');
const auth = require('../middleware/auth');
const RecurringDonation = require('../models/RecurringDonation');

const router = express.Router();

// Create a recurring donation
router.post('/', auth, async (req, res) => {
    if (req.user.role !== 'Donor') return res.status(403).json({ msg: 'Access denied' });
    try {
        const { foodName, quantity, frequency, address, pickupTimeRange } = req.body;

        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + (frequency === 'Daily' ? 1 : 7));

        const recurring = new RecurringDonation({
            donorId: req.user.id,
            foodName,
            quantity,
            frequency,
            address,
            pickupTimeRange,
            nextDate
        });

        await recurring.save();
        res.json(recurring);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Get user's recurring donations
router.get('/my-recurring', auth, async (req, res) => {
    try {
        const list = await RecurringDonation.find({ donorId: req.user.id });
        res.json(list);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Delete a recurring plan
router.delete('/:id', auth, async (req, res) => {
    try {
        await RecurringDonation.findOneAndDelete({ _id: req.params.id, donorId: req.user.id });
        res.json({ msg: 'Recurring donation deleted' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;
