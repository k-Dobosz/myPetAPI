const mongoose = require('mongoose')

const dataSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    userId: { type: String, require: true },
    petId: { type: String, require: true },
    collarId: { type: String, require: true },
    type: { type: String, require: true },
    data: { type: String, require: true },
    createdDate: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Data', dataSchema)