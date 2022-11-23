const mongoose = require('mongoose');

const VaccinationCenter = new mongoose.Schema({
    name: {
        type: String,
    },
    address: {
        type: String,
    },
    did: {
        type: String,
    },
    jwt_token: {
        type: String,
    },
    
});

module.exports = mongoose.model('VaccinationCenter', VaccinationCenter);