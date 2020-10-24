const mongoose = require('mongoose')

const notificationSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    userId: { type: String, require: true },
    petId: { type: String, require: true },
    type: { type: String, require: true },
    createdDate: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Notification', notificationSchema)