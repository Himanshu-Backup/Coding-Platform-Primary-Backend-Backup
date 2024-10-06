// models/Problem.js
const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    sampleTestCases: {
        type: [
            {
                input: { type: String, required: true },
                output: { type: String, required: true }
            }
        ],
        required: true
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

module.exports = mongoose.model('Problem', problemSchema);
