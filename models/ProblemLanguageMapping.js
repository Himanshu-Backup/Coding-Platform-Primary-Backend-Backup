const mongoose = require('mongoose');

const problemLanguageMappingSchema = new mongoose.Schema({
    problemID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Problem',
        required: true
    },
    language: {
        type: String,
        required: true
    },
    problemLanguageCodeMapping: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProblemLanguageCodeMapping'  // Reference to the code mapping
    }]
});

const ProblemLanguageMapping = mongoose.model('ProblemLanguageMapping', problemLanguageMappingSchema);
module.exports = ProblemLanguageMapping;
