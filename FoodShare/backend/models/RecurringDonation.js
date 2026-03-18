const mongoose = require('mongoose');

const RecurringDonationSchema = new mongoose.Schema({
    donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    foodName: { type: String, required: true },
    quantity: { type: String, required: true },
    frequency: { type: String, enum: ['Daily', 'Weekly'], required: true },
    address: { type: String, required: true },
    pickupTimeRange: { type: String },
    nextDate: { type: Date, required: true }
}, { timestamps: true });

module.exports = mongoose.model('RecurringDonation', RecurringDonationSchema);
