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


const Problem = mongoose.model('Problem', problemSchema);
module.exports = Problem;
