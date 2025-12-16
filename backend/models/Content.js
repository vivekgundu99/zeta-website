const mongoose = require('mongoose');

const paperSchema = new mongoose.Schema({
    topicName: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    pdfUrl: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const channelSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    photoUrl: {
        type: String,
        required: false,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const appSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    features: {
        type: String,
        required: true
    },
    downloadUrl: {
        type: String,
        required: true
    },
    photoUrl: {
        type: String,
        required: false,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const helpSchema = new mongoose.Schema({
    pdfUrl: {
        type: String,
        required: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const Paper = mongoose.model('Paper', paperSchema);
const Channel = mongoose.model('Channel', channelSchema);
const App = mongoose.model('App', appSchema);
const Help = mongoose.model('Help', helpSchema);

module.exports = { Paper, Channel, App, Help };