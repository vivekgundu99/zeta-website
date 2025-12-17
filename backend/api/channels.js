// backend/api/channels.js
const { Channel } = require('../models/Content');
const connectDB = require('../lib/db');
const jwt = require('jsonwebtoken');
const setCorsHeaders = require('../lib/cors'); // ADD THIS

module.exports = async (req, res) => {
    // Enable CORS
    if (setCorsHeaders(req, res)) return;

    await connectDB();

    try {
        // Verify authentication
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ message: 'No authentication token' });
        }

        jwt.verify(token, process.env.JWT_SECRET);

        if (req.method === 'GET') {
            const channels = await Channel.find().sort({ createdAt: -1 }).lean();
            
            // Ensure photoUrl is always included (even if empty)
            const channelsWithPhotos = channels.map(channel => ({
                _id: channel._id,
                name: channel.name,
                description: channel.description,
                url: channel.url,
                photoUrl: channel.photoUrl || '', // Ensure it's always a string
                createdAt: channel.createdAt
            }));
            
            return res.json(channelsWithPhotos);
        }

        res.status(405).json({ message: 'Method not allowed' });
    } catch (error) {
        console.error('Channels API Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};