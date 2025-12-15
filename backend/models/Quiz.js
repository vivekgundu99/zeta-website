const mongoose = require('mongoose');

const dailyQuizSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    optionA: {
        type: String,
        required: true
    },
    optionB: {
        type: String,
        required: true
    },
    optionC: {
        type: String,
        required: true
    },
    optionD: {
        type: String,
        required: true
    },
    correctOption: {
        type: String,
        required: true,
        enum: ['A', 'B', 'C', 'D']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const questionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    optionA: {
        type: String,
        required: true
    },
    optionB: {
        type: String,
        required: true
    },
    optionC: {
        type: String,
        required: true
    },
    optionD: {
        type: String,
        required: true
    },
    correctOption: {
        type: String,
        required: true,
        enum: ['A', 'B', 'C', 'D']
    }
});

const topicSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    questions: [questionSchema],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const DailyQuiz = mongoose.model('DailyQuiz', dailyQuizSchema);
const Topic = mongoose.model('Topic', topicSchema);

module.exports = { DailyQuiz, Topic };