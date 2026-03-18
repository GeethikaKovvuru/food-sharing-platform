const mongoose = require('mongoose');

const FavoriteSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    donationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Donation', required: true }
}, { timestamps: true });

// Prevent duplicate favorites
FavoriteSchema.index({ userId: 1, donationId: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', FavoriteSchema);
