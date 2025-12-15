// routes/apps.js
const express = require('express');
const router = express.Router();
const { App } = require('../models/Content');
const { auth } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
    try {
        const apps = await App.find().sort({ createdAt: -1 });
        res.json(apps);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching apps' });
    }
});

module.exports = router;
