const express = require('express');
const auth = require('../middleware/auth');
const Report = require('../models/Report');

const router = express.Router();

// Create a report
router.post('/', auth, async (req, res) => {
    try {
        const { reportedUserId, donationId, reason } = req.body;
        
        const report = new Report({
            reporterId: req.user.id,
            reportedUserId,
            donationId,
            reason
        });

        await report.save();
        res.json({ msg: 'Report submitted successfully' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Admin: Get all reports
router.get('/', auth, async (req, res) => {
    if (req.user.role !== 'Admin') return res.status(403).json({ msg: 'Access denied' });
    try {
        const reports = await Report.find()
            .populate('reporterId', 'name email')
            .populate('reportedUserId', 'name email')
            .populate('donationId', 'foodName');
        res.json(reports);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Admin: Resolve report
router.put('/:id/resolve', auth, async (req, res) => {
    if (req.user.role !== 'Admin') return res.status(403).json({ msg: 'Access denied' });
    try {
        const report = await Report.findByIdAndUpdate(req.params.id, { status: 'Resolved' }, { new: true });
        res.json(report);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;
