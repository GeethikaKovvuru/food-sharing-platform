const mongoose = require('mongoose');

const DonationSchema = new mongoose.Schema({
    donor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    food_name: { type: String, required: true },
    quantity: { type: String, required: true },
    expiry_date: { type: Date, required: true },
    address: { type: String, required: true },
    image_url: { type: String },
    qr_code: { type: String }, // Storing base64 image or a URL of the QR code
    status: { type: String, enum: ['Pending', 'Claimed', 'Delivered'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('Donation', DonationSchema);
