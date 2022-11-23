const mongoose = require('mongoose');

const VerifiablePresentationSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    issuerDid: {
        type: String,
    },
    subjectDid: {
        type: String,
    },
    vpJwt: {
        type: String,
    },
    vp_cid: {
        type: String,
    },
    vp_qr_cid: {
        type: String,
    },
});

module.exports = mongoose.model('VerifiablePresentation', VerifiablePresentationSchema);