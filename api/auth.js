const jwt = require('jsonwebtoken')
const User = require('./models/user.model')
require('dotenv').config()

module.exports = () => {
    return (req, res, next) => {
        let token
        if (req.headers.authorization !== undefined) {
            token = req.headers.authorization.split(" ")[1]
        } else {
            token = req.body.token
        }
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
          if (err) {
              return res.status(401).json({
                  error: true,
                  error_msg: 'Auth failed'
              })
          }

          if (req.params.userId !== decoded.userId) {
              return res.status(401).json({
                  error: true,
                  error_msg: 'Auth failed'
              })
          }

          User.find({ "_id": decoded.userId })
              .exec()
              .then(result => {
                  next()
              })
              .catch(err => {
                  return res.status(401).json({
                      error: true,
                      error_msg: 'Auth failed'
                  })
              })
        })
    }
}