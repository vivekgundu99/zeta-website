const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const { auth } = require('../middleware/auth');

// Signup
router.post('/signup', async (req, res) => {
    try {
        const { fullname, email, password, securityQuestion, securityAnswer } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        // Create new user
        const user = new User({
            fullname,
            email,
            password,
            securityQuestion,
            securityAnswer
        });

        await user.save();

        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Error creating user' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                fullname: user.fullname,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Error logging in' });
    }
});

// Get security question
router.get('/security-question', async (req, res) => {
    try {
        const { email } = req.query;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ securityQuestion: user.securityQuestion });
    } catch (error) {
        console.error('Error fetching security question:', error);
        res.status(500).json({ message: 'Error fetching security question' });
    }
});

// Reset password
router.post('/reset-password', async (req, res) => {
    try {
        const { email, securityQuestion, securityAnswer, newPassword } = req.body;

        const user = await User.findOne({ email, securityQuestion });
        if (!user) {
            return res.status(404).json({ message: 'User not found or incorrect security question' });
        }

        // Verify security answer
        const isAnswerValid = await user.compareSecurityAnswer(securityAnswer);
        if (!isAnswerValid) {
            return res.status(401).json({ message: 'Incorrect security answer' });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({ message: 'Error resetting password' });
    }
});

// Update password (authenticated)
router.post('/update-password', auth, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.userId);

        // Verify current password
        const isPasswordValid = await user.comparePassword(currentPassword);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Password update error:', error);
        res.status(500).json({ message: 'Error updating password' });
    }
});

// Delete account
router.delete('/delete-account', auth, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.userId);
        res.json({ message: 'Account deleted successfully' });
    } catch (error) {
        console.error('Account deletion error:', error);
        res.status(500).json({ message: 'Error deleting account' });
    }
});

module.exports = router;