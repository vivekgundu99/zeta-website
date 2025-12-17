// backend/api/apps.js
const { App } = require('../models/Content');
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
            const apps = await App.find().sort({ createdAt: -1 }).lean();
            
            // Ensure photoUrl is always included (even if empty)
            const appsWithPhotos = apps.map(app => ({
                _id: app._id,
                name: app.name,
                features: app.features,
                downloadUrl: app.downloadUrl,
                photoUrl: app.photoUrl || '', // Ensure it's always a string
                createdAt: app.createdAt
            }));
            
            return res.json(appsWithPhotos);
        }

        res.status(405).json({ message: 'Method not allowed' });
    } catch (error) {
        console.error('Apps API Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};