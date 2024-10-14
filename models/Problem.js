const mongoose = require('mongoose');
const problemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    testCases: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProblemTestCaseMapping'
    }],
    problemLanguageMapping: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProblemLanguageMapping'
    }],
    sampleTestCases: [{
        input: {
            type: String,
            required: true
        },
        output: {
            type: String,
            required: true
        }
    }]
});

// Adding field-level validation for `sampleTestCases`
problemSchema.path('sampleTestCases').validate(function (value) {
    // Ensure that there are exactly 2 elements in the `sampleTestCases` array
    return value.length === 2;
}, 'There must be exactly 2 sample test cases.');

const Problem = mongoose.model('Problem', problemSchema);
module.exports = Problem;
