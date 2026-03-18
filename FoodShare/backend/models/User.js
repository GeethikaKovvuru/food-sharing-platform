const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['Donor', 'Receiver', 'Admin', 'NGO'], required: true },
    verified: { type: Boolean, default: false },
    rating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },
    points: { type: Number, default: 0 },
    badges: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
