// backend/api/help.js
const { Help } = require('../models/Content');
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
            const help = await Help.findOne().sort({ updatedAt: -1 });
            return res.json(help || {});
        }

        res.status(405).json({ message: 'Method not allowed' });
    } catch (error) {
        console.error('Help API Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};