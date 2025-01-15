const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    phoneNumber: {
        type: String,
        required: true,
        unique: true,
    },
    points: {
        type: [Number],
        default: [],
    },
});

const userModule = mongoose.model('user', userSchema);

module.exports = userModule