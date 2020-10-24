const mongoose = require('mongoose')

const petSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    collarId: { type: String, require: true },
    userId: { type: String, require: true },
    name: { type: String, require: true},
    color: { type: String, require: true },
    birthDate: { type: Date },
    createdDate: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Pet', petSchema)