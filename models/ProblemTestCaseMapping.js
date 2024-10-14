const mongoose = require('mongoose');
const problemTestCaseMappingSchema = new mongoose.Schema({
    problemID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Problem',
        required: true
    },
    input: {
        type: String,
        required: true
    },
    output: {
        type: String,
        required: true
    }
});

const ProblemTestCaseMapping = mongoose.model('ProblemTestCaseMapping', problemTestCaseMappingSchema);
module.exports = ProblemTestCaseMapping;
