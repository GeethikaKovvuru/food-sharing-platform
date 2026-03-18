const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// Make io accessible to our router
app.set('io', io);

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    
    socket.on('joinRoom', (userId) => {
        socket.join(userId);
        console.log(`User ${userId} joined their personal room`);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/donations', require('./routes/donations'));
app.use('/api/claims', require('./routes/claims'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/upload', require('./routes/upload'));
// NEW V2 ROUTES
app.use('/api/chat', require('./routes/chat'));
app.use('/api/ratings', require('./routes/ratings'));
app.use('/api/favorites', require('./routes/favorites'));
app.use('/api/reports', require('./routes/reports'));
// NEW V3 ROUTES
app.use('/api/leaderboard', require('./routes/leaderboard'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/ngo', require('./routes/ngo'));
app.use('/api/recurring', require('./routes/recurring'));

// Node-Cron Setup
const cron = require('node-cron');
const RecurringDonation = require('./models/RecurringDonation');
const Donation = require('./models/Donation');

cron.schedule('0 0 * * *', async () => {
  try {
    const today = new Date();
    const dueTemplates = await RecurringDonation.find({ nextDate: { $lte: today } });
    
    for (let template of dueTemplates) {
      // Create new live donation
      const don = new Donation({
        donorId: template.donorId,
        foodName: template.foodName,
        quantity: template.quantity,
        address: template.address,
        pickupTimeRange: template.pickupTimeRange,
        expiryDate: new Date(today.getTime() + 24 * 60 * 60 * 1000) // expires next day
      });
      await don.save();

      // Update nextDate string on template securely
      let newDate = new Date(template.nextDate);
      newDate.setDate(newDate.getDate() + (template.frequency === 'Daily' ? 1 : 7));
      template.nextDate = newDate;
      await template.save();
    }
    console.log(`Cron: Created ${dueTemplates.length} automated recurring donations.`);
  } catch (err) { console.error('Cron error:', err); }
});

// DB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/foodshare', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log(err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
