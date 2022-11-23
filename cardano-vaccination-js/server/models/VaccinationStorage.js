const mongoose = require('mongoose');

const VaccinationStorage = new mongoose.Schema({
    name: {
        type: String,
    },
    company: {
        type: String,
    },
    code: {
        type: String,
    },
    dosage: {
        type: Number,
    },
    hash: {
        type: String,
    },
    
});

module.exports = mongoose.model('VaccinationStorage', VaccinationStorage);