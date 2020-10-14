const mongoose = require('mongoose')
require('dotenv').config()

module.exports = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        console.log('DB connected')
    } catch (e) {
        console.log(e)
        throw e
    }
}