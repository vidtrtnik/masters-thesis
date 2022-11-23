const mongoose = require('mongoose');

const Authority = new mongoose.Schema({
    username: {
        type: String,
    },
    password: {
        type: String,
    },
    
});

module.exports = mongoose.model('Authority', Authority);