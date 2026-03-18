const express = require('express');
const auth = require('../middleware/auth');
const Chat = require('../models/Chat');

const router = express.Router();

// Get chat history for a specific donation claim
router.get('/:donationId', auth, async (req, res) => {
    try {
        const chat = await Chat.findOne({
            donationId: req.params.donationId,
            $or: [{ donorId: req.user.id }, { receiverId: req.user.id }]
        }).populate('messages.senderId', 'name role');
        
        if (!chat) return res.json({ messages: [] });
        res.json(chat);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Send a new message
router.post('/:donationId', auth, async (req, res) => {
    try {
        const { text, receiverId } = req.body; // receiverId is the ID of the opposing user
        let chat = await Chat.findOne({ donationId: req.params.donationId });

        if (!chat) {
            chat = new Chat({
                donationId: req.params.donationId,
                donorId: req.user.role === 'Donor' ? req.user.id : receiverId,
                receiverId: req.user.role === 'Receiver' ? req.user.id : receiverId,
                messages: []
            });
        }

        const newMessage = { senderId: req.user.id, text };
        chat.messages.push(newMessage);
        await chat.save();

        // Emit socket event to the opposing user
        const io = req.app.get('io');
        if (io) {
            io.to(receiverId.toString()).emit('receiveMessage', {
                donationId: req.params.donationId,
                message: newMessage
            });
        }

        res.json(chat.messages[chat.messages.length - 1]);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;
