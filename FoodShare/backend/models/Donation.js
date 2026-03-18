const mongoose = require('mongoose');

const DonationSchema = new mongoose.Schema({
    donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    foodName: { type: String, required: true },
    quantity: { type: String, required: true },
    expiryDate: { type: Date, required: true },
    address: { type: String, required: true },
    imageUrl: { type: String },
    qrCode: { type: String }, // Storing base64 image or a URL of the QR code
    pickupTimeRange: { type: String }, // NEW: e.g. "10:00 AM - 12:00 PM"
    status: { type: String, enum: ['Pending', 'Claimed', 'Delivered'], default: 'Pending' }
}, { timestamps: true });

// Indexes for fast search/filter by location and expiry
DonationSchema.index({ address: 'text' });
DonationSchema.index({ expiryDate: 1 });
DonationSchema.index({ status: 1 });

module.exports = mongoose.model('Donation', DonationSchema);
