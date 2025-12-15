// routes/channels.js
const express = require('express');
const router = express.Router();
const { Channel } = require('../models/Content');
const { auth } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
    try {
        const channels = await Channel.find().sort({ createdAt: -1 });
        res.json(channels);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching channels' });
    }
});

module.exports = router;
