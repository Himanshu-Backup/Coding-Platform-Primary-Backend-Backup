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
    testCases: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'TestCase'
        }
    ],
    code: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Code'
        }
    ],
    sampleTestCases: {
        type: [
            {
                input: { type: String, required: true },
                output: { type: String, required: true }
            }
        ],
        validate: [arrayLimit, '{PATH} exceeds the limit of 2'], // Limits the array to 2 sample test cases
        required: true
    }
});

function arrayLimit(val) {
    return val.length === 2;
}

module.exports = mongoose.model('Problem', problemSchema);
