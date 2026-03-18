const mongoose = require('mongoose');

const NgoRequestSchema = new mongoose.Schema({
    ngoId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    quantity: { type: String, required: true },
    schedule: { type: String, required: true },
    status: { type: String, enum: ['Open', 'Fulfilled'], default: 'Open' }
}, { timestamps: true });

module.exports = mongoose.model('NgoRequest', NgoRequestSchema);
