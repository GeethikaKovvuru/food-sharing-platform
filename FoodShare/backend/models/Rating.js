const mongoose = require('mongoose');

const RatingSchema = new mongoose.Schema({
    donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    claimId: { type: mongoose.Schema.Types.ObjectId, ref: 'Claim', required: true },
    score: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Rating', RatingSchema);
