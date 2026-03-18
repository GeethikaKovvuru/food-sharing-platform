const mongoose = require('mongoose');

const ClaimSchema = new mongoose.Schema({
    donationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Donation', required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    claimDate: { type: Date, default: Date.now },
    selectedPickupTime: { type: String }, // NEW: Specific time chosen by Receiver
    status: { type: String, enum: ['Pending', 'Completed'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('Claim', ClaimSchema);
