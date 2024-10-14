const mongoose = require('mongoose');
const problemLanguageCodeMappingSchema = new mongoose.Schema({
    problemLanguageMappingID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProblemLanguageMapping',
        required: true
    },
    preCode: String,
    postCode: String,
    solutionCode: String,
    boilerplateCode: String
});

const ProblemLanguageCodeMapping = mongoose.model('ProblemLanguageCodeMapping', problemLanguageCodeMappingSchema);
module.exports = ProblemLanguageCodeMapping;
