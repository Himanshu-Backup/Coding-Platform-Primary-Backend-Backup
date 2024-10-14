const mongoose = require('mongoose');
const contestSchema = new mongoose.Schema({
    contestName: {
        type: String,
        required: true
    },
    problems: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Problem'
    }],
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
});

const Contest = mongoose.model('Contest', contestSchema);
module.exports = Contest;
