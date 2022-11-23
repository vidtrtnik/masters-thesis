const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    role: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'roleModel'
    },
    roleModel: {
        type: String,
        required: true,
        enum: ['Authority', 'Patient', 'VaccinationCenter', 'Verifier']
      }
});

module.exports = mongoose.model('User', UserSchema);


/*
    vc: {
        type: String,
    },
    transactionId: {
        type: String,
    },
*/