const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
    reporterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reportedUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    donationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Donation' },
    reason: { type: String, required: true },
    status: { type: String, enum: ['Open', 'Resolved'], default: 'Open' }
}, { timestamps: true });

module.exports = mongoose.model('Report', ReportSchema);
