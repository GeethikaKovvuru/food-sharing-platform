const express = require('express');
const auth = require('../middleware/auth');
const Rating = require('../models/Rating');
const User = require('../models/User');

const router = express.Router();

// Submit a rating
router.post('/', auth, async (req, res) => {
    if (req.user.role !== 'Receiver') return res.status(403).json({ msg: 'Only receivers can rate' });

    try {
        const { donorId, claimId, score, comment } = req.body;
        
        let rating = new Rating({ donorId, receiverId: req.user.id, claimId, score, comment });
        await rating.save();

        // Update Donor's average rating
        const allRatings = await Rating.find({ donorId });
        const avgScore = allRatings.reduce((acc, curr) => acc + curr.score, 0) / allRatings.length;
        
        await User.findByIdAndUpdate(donorId, { 
            rating: avgScore.toFixed(1),
            totalRatings: allRatings.length 
        });

        res.json({ msg: 'Rating submitted successfully' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Get ratings for a donor
router.get('/:donorId', async (req, res) => {
    try {
        const ratings = await Rating.find({ donorId: req.params.donorId }).populate('receiverId', 'name');
        res.json(ratings);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;
