const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
    did: {
        type: String,
    },
    email: {
        type: String,
    },
    name: {
        type: String,
    },
    zzzs_num: {
        type: String,
    },
    jwt_token: {
        type: String,
    },
    cardano_address: {
        type: String,
    }
    
});

module.exports = mongoose.model('Patient', PatientSchema);