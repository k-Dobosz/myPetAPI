const mongoose = require('mongoose')

const collarSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    code: { type: String, require: true },
    createdDate: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Collar', collarSchema)