const mongoose = require('mongoose')
require('dotenv').config()

module.exports = async () => {
    try {
        if (process.env.MONGODB_URL === '') {
            throw 'No MONGODB_URL specified'
        }

        await mongoose.connect(process.env.MONGODB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        console.log('DB connected')
    } catch (e) {
        console.log(e)
    }
}