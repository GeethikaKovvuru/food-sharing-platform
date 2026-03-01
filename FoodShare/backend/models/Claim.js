const mongoose = require('mongoose');

const ClaimSchema = new mongoose.Schema({
    donation_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Donation', required: true },
    receiver_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['Pending', 'Completed'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('Claim', ClaimSchema);
