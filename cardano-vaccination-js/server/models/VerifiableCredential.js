const mongoose = require('mongoose');

const VerifiableCredentialSchema = new mongoose.Schema({
    vaccinationInfo: {
        type: String,
    },
    additionalInfo: {
        type: String,
    },
    issuerDid: {
        type: String,
    },
    subjectDid: {
        type: String,
    },
    vcJwt: {
        type: String,
    },
});

module.exports = mongoose.model('VerifiableCredential', VerifiableCredentialSchema);