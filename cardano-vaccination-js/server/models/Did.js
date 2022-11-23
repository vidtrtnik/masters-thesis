const mongoose = require('mongoose');

const DidSchema = new mongoose.Schema({
    did: {
        type: String,
    },
    
    did_doc: {
        type: String,
    },

    did_keys: {
        type: String,
    },
    
});

module.exports = mongoose.model('Did', DidSchema);