const express = require('express');
const router = express.Router();
const { DailyQuiz, Topic } = require('../models/Quiz');
const { Paper, Channel, App, Help } = require('../models/Content');
const { adminAuth } = require('../middleware/auth');

// ===== DAILY QUIZ MANAGEMENT =====
router.post('/quiz/daily', adminAuth, async (req, res) => {
    try {
        // Delete existing daily quiz
        await DailyQuiz.deleteMany({});
        
        const dailyQuiz = new DailyQuiz(req.body);
        await dailyQuiz.save();
        res.status(201).json(dailyQuiz);
    } catch (error) {
        console.error('Error creating daily quiz:', error);
        res.status(500).json({ message: 'Error creating daily quiz' });
    }
});

router.put('/quiz/daily/:id', adminAuth, async (req, res) => {
    try {
        const dailyQuiz = await DailyQuiz.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(dailyQuiz);
    } catch (error) {
        res.status(500).json({ message: 'Error updating daily quiz' });
    }
});

router.delete('/quiz/daily/:id', adminAuth, async (req, res) => {
    try {
        await DailyQuiz.findByIdAndDelete(req.params.id);
        res.json({ message: 'Daily quiz deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting daily quiz' });
    }
});

// ===== COMPETITIVE QUIZ TOPICS =====
router.post('/quiz/topic', adminAuth, async (req, res) => {
    try {
        const topic = new Topic(req.body);
        await topic.save();
        res.status(201).json(topic);
    } catch (error) {
        res.status(500).json({ message: 'Error creating topic' });
    }
});

router.delete('/quiz/topic/:topicId', adminAuth, async (req, res) => {
    try {
        await Topic.findByIdAndDelete(req.params.topicId);
        res.json({ message: 'Topic deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting topic' });
    }
});

// ===== TOPIC QUESTIONS =====
router.post('/quiz/topic/:topicId/question', adminAuth, async (req, res) => {
    try {
        const topic = await Topic.findById(req.params.topicId);
        if (!topic) {
            return res.status(404).json({ message: 'Topic not found' });
        }

        topic.questions.push(req.body);
        await topic.save();
        res.status(201).json(topic);
    } catch (error) {
        res.status(500).json({ message: 'Error adding question' });
    }
});

router.put('/quiz/topic/:topicId/question/:questionId', adminAuth, async (req, res) => {
    try {
        const topic = await Topic.findById(req.params.topicId);
        if (!topic) {
            return res.status(404).json({ message: 'Topic not found' });
        }

        const question = topic.questions.id(req.params.questionId);
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        Object.assign(question, req.body);
        await topic.save();
        res.json(topic);
    } catch (error) {
        res.status(500).json({ message: 'Error updating question' });
    }
});

router.delete('/quiz/topic/:topicId/question/:questionId', adminAuth, async (req, res) => {
    try {
        const topic = await Topic.findById(req.params.topicId);
        if (!topic) {
            return res.status(404).json({ message: 'Topic not found' });
        }

        topic.questions.pull(req.params.questionId);
        await topic.save();
        res.json({ message: 'Question deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting question' });
    }
});

// ===== RESEARCH PAPERS =====
router.post('/papers', adminAuth, async (req, res) => {
    try {
        const paper = new Paper(req.body);
        await paper.save();
        res.status(201).json(paper);
    } catch (error) {
        res.status(500).json({ message: 'Error creating paper' });
    }
});

router.put('/papers/:id', adminAuth, async (req, res) => {
    try {
        const paper = await Paper.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(paper);
    } catch (error) {
        res.status(500).json({ message: 'Error updating paper' });
    }
});

router.delete('/papers/:id', adminAuth, async (req, res) => {
    try {
        await Paper.findByIdAndDelete(req.params.id);
        res.json({ message: 'Paper deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting paper' });
    }
});

// ===== YOUTUBE CHANNELS =====
router.post('/channels', adminAuth, async (req, res) => {
    try {
        const channel = new Channel(req.body);
        await channel.save();
        res.status(201).json(channel);
    } catch (error) {
        res.status(500).json({ message: 'Error creating channel' });
    }
});

router.put('/channels/:id', adminAuth, async (req, res) => {
    try {
        const channel = await Channel.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(channel);
    } catch (error) {
        res.status(500).json({ message: 'Error updating channel' });
    }
});

router.delete('/channels/:id', adminAuth, async (req, res) => {
    try {
        await Channel.findByIdAndDelete(req.params.id);
        res.json({ message: 'Channel deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting channel' });
    }
});

// ===== APPS =====
router.post('/apps', adminAuth, async (req, res) => {
    try {
        const app = new App(req.body);
        await app.save();
        res.status(201).json(app);
    } catch (error) {
        res.status(500).json({ message: 'Error creating app' });
    }
});

router.put('/apps/:id', adminAuth, async (req, res) => {
    try {
        const app = await App.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(app);
    } catch (error) {
        res.status(500).json({ message: 'Error updating app' });
    }
});

router.delete('/apps/:id', adminAuth, async (req, res) => {
    try {
        await App.findByIdAndDelete(req.params.id);
        res.json({ message: 'App deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting app' });
    }
});

// ===== HELP =====
router.post('/help', adminAuth, async (req, res) => {
    try {
        await Help.deleteMany({});
        const help = new Help(req.body);
        await help.save();
        res.status(201).json(help);
    } catch (error) {
        res.status(500).json({ message: 'Error setting help' });
    }
});

router.put('/help/:id', adminAuth, async (req, res) => {
    try {
        const help = await Help.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(help);
    } catch (error) {
        res.status(500).json({ message: 'Error updating help' });
    }
});

router.delete('/help/:id', adminAuth, async (req, res) => {
    try {
        await Help.findByIdAndDelete(req.params.id);
        res.json({ message: 'Help deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting help' });
    }
});

module.exports = router;