let mongoose = require('mongoose');

let devSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    devId: {
        type: Number
    },
    name: {
        firstName: {
            type: String,
            required: true
        },
        lastName: String
    },
    level: {
        type: String,
        required: true
    },
    address: {
        state: String,
        suburb: String,
        street: String,
        unit: String
    }
});

module.exports = mongoose.model('DevCollection', devSchema, 'Developer');