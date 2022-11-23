const mongoose = require('mongoose');

const RevocationVCSchema = new mongoose.Schema({
    vc: {
        type: String,
        default: "",
    },
    c: {
        type: Number,
        default: 0,
    },
    encodedList: {
        type: String,
        default: "",
    },
},
{
    capped: { max: 1, size: 1 },
},
);

module.exports = mongoose.model('RevocationVC', RevocationVCSchema);