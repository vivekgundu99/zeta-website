// backend/api/papers.js
const { Paper } = require('../models/Content');
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

        const url = new URL(req.url, `http://${req.headers.host}`);
        const path = url.pathname;

        // Get all papers
        if (path === '/api/papers' && req.method === 'GET') {
            const papers = await Paper.find().sort({ createdAt: -1 });
            return res.json(papers);
        }

        // Search papers
        if (path === '/api/papers/search' && req.method === 'GET') {
            const q = url.searchParams.get('q');
            
            const papers = await Paper.find({
                topicName: { $regex: q, $options: 'i' }
            }).sort({ createdAt: -1 });
            
            return res.json(papers);
        }

        res.status(404).json({ message: 'Route not found' });
    } catch (error) {
        console.error('Papers API Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};