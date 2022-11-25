const mongoose = require('mongoose');

const VaccinationCertificateSchema = new mongoose.Schema({
    additionalInfo: {
        type: String,
    },
    date: {
        type: String,
    },
    transactionId: {
        type: String,
    },
    revokeId: {
        type: String,
    },
    vcentreId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'VaccinationCenter',
    },
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
    },
    vaccineId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'VaccinationStorage',
    },
    vcId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'VerifiableCredential',
    }

});

module.exports = mongoose.model('VaccinationCertificate', VaccinationCertificateSchema);
