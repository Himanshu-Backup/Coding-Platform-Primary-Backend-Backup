const mongoose = require('mongoose');

const codeSchema = new mongoose.Schema({
    problemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Problem',
        required: true
    },
    language: {
        type: String,
        required: true // e.g., 'cpp', 'java', 'python'
    },
    preCode: {
        type: String, // The code provided before the user function.
        required: true
    },
    postCode: {
        type: String, // The code provided after the user function.
        required: true
    },
    solutionCode: {
        type: String, // The correct solution for the problem.
        required: true
    }
});

module.exports = mongoose.model('Code', codeSchema);
