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
    }
});

const ProblemLanguageMapping = mongoose.model('ProblemLanguageMapping', problemLanguageMappingSchema);
module.exports = ProblemLanguageMapping;
