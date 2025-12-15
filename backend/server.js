const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.error('MongoDB Connection Error:', err));

// Routes
const authRoutes = require('./routes/auth');
const quizRoutes = require('./routes/quiz');
const paperRoutes = require('./routes/papers');
const channelRoutes = require('./routes/channels');
const appRoutes = require('./routes/apps');
const helpRoutes = require('./routes/help');
const adminRoutes = require('./routes/admin');

app.use('/auth', authRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/papers', paperRoutes);
app.use('/api/channels', channelRoutes);
app.use('/api/apps', appRoutes);
app.use('/api/help', helpRoutes);
app.use('/api/admin', adminRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});