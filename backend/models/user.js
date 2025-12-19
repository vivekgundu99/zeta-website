const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const quizAnswerSchema = new mongoose.Schema({
    questionId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    answer: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['daily', 'competitive'],
        required: true
    },
    isCorrect: {
        type: Boolean,
        required: true
    },
    timeSpent: {
        type: Number,
        default: 0 // Time in seconds
    },
    answeredAt: {
        type: Date,
        default: Date.now
    }
});

const userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    securityQuestion: {
        type: String,
        required: true
    },
    securityAnswer: {
        type: String,
        required: true
    },
    quizAnswers: [quizAnswerSchema],
    totalTimeConsumed: {
        type: Number,
        default: 0 // Total time in seconds
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        this.securityAnswer = await bcrypt.hash(this.securityAnswer.toLowerCase(), salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Method to compare security answer
userSchema.methods.compareSecurityAnswer = async function(candidateAnswer) {
    return await bcrypt.compare(candidateAnswer.toLowerCase(), this.securityAnswer);
};

module.exports = mongoose.model('User', userSchema);