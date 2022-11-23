const mongoose = require('mongoose');

const Verifier = new mongoose.Schema({
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

module.exports = mongoose.model('Verifier', Verifier);