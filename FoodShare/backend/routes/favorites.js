const express = require('express');
const auth = require('../middleware/auth');
const Favorite = require('../models/Favorite');

const router = express.Router();

// Toggle favorite
router.post('/:donationId', auth, async (req, res) => {
    try {
        const existing = await Favorite.findOne({ 
            userId: req.user.id, 
            donationId: req.params.donationId 
        });

        if (existing) {
            await Favorite.findByIdAndDelete(existing._id);
            return res.json({ msg: 'Removed from favorites', isFavorite: false });
        } else {
            const favorite = new Favorite({
                userId: req.user.id,
                donationId: req.params.donationId
            });
            await favorite.save();
            return res.json({ msg: 'Added to favorites', isFavorite: true });
        }
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Get user's favorites
router.get('/', auth, async (req, res) => {
    try {
        const favorites = await Favorite.find({ userId: req.user.id }).populate('donationId');
        res.json(favorites);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;
