const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    email: { type: String, require: true },
    password: { type: String, require: true },
    last_token: { type: String },
    last_refresh_token: { type: String },
    createdDate: { type: Date, default: Date.now }
})

module.exports = mongoose.model('User', userSchema)