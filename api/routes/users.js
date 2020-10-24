const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const User = require('../models/user.model')
const Pet = require('../models/pet.model')
const Collar = require('../models/collar.model')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const auth = require('../auth')
require('dotenv').config()

router.get('/', getAllUsers)
router.post('/register', register)
router.post('/login', login)
router.get('/:userId', auth(), getUserById)
router.delete('/:userId', auth(), deleteUserById)
router.post('/:userId/change_password', auth(), userChangePassword)
router.get('/:userId/pets', auth(), getUsersAllPets)
router.post('/:userId/pets/add', auth(), userAddPet)
router.post('/refresh_token', refresh_token)

function getAllUsers(req, res, next) {
    User.find()
        .exec()
        .then(result => {
            if (result) {
                res.status(200).json({
                    error: false,
                    data: result
                })
            } else {
                res.status(404).json({
                    error: true,
                    error_msg: "No users found"
                })
            }
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                error: true,
                error_msg: err
            })
        })
}

function getUserById(req, res, next) {
    const id = req.params.userId

    if (id !== undefined) {
        User.findById(id)
            .exec()
            .then(result => {
                if (result) {
                    res.status(200).json({
                        error: false,
                        data: result
                    })
                } else {
                    req.status(404).json({
                        error: true,
                        error_msg: "No user found by provided id"
                    })
                }
            })
            .catch(err => {
                res.status(500).json({
                    error: true,
                    error_msg: err
                })
            })
    } else {
        res.status(400).json({
            error: true,
            error_msg: "No enough data provided"
        })
    }
}

function deleteUserById(req, res, next) {
    const userId = req.params.userId

    if (userId !== undefined) {
        User.deleteOne({_id: userId})
            .exec()
            .then(result => {
                console.log(result)
                res.status(200).json({
                    error: false,
                    message: "User successfully deleted"
                })
            })
            .catch(err => {
                res.status(500).json({
                    error: true,
                    error_msg: err
                })
            })
    } else {
        res.status(400).json({
            error: true,
            error_msg: "No enough data provided"
        })
    }
}

function register(req, res, next) {
    const firstName = req.body.firstName
    const lastName = req.body.lastName
    const email = req.body.email.toLowerCase()
    const password = req.body.password

    if (firstName !== undefined && lastName !== undefined && email !== undefined && password !== undefined) {
        User.find({ email: email })
            .exec()
            .then(result => {
                if (result.length === 0) {
                    bcrypt.hash(password, 10, (err, data) => {
                        if (!err) {
                            const user = new User({
                                _id: new mongoose.Types.ObjectId,
                                firstName: firstName,
                                lastName: lastName,
                                email: email,
                                password: data
                            })

                            user.save()
                                .then(result => {
                                    res.status(201).json({
                                        error: false,
                                        message: 'User created',
                                        createdUser: user,
                                    })
                                })
                                .catch(err => {
                                    console.log(err)
                                    res.status(500).json({
                                        error: true,
                                        error_msg: err
                                    })
                                })
                        } else {
                            res.status(500).json({
                                error: true,
                                error_msg: err
                            })
                        }
                    })
                } else {
                    res.status(409).json({
                        error: true,
                        error_msg: 'Account with provided email already exists'
                    })
                }
            })
            .catch(err => console.log(err))
    } else {
        res.status(400).json({
            error: true,
            error_msg: 'Not enough data provided'
        })
    }
}

function login(req, res, next) {
    const email = req.body.email.toLowerCase()
    const password = req.body.password

    if (email !== undefined && password !== undefined) {
        User.findOne({ "email": email })
            .exec()
            .then(data => {
                if (data) {
                    bcrypt.compare(password, data.password, (err, result) => {
                        if (!err) {
                            if (result) {
                                const token = jwt.sign({
                                    userId: data.id
                                }, process.env.JWT_SECRET, {
                                    "expiresIn": "30m"
                                })
                                const refreshToken = jwt.sign({
                                    userId: data.id
                                }, process.env.JWT_SECRET_REFRESH, {
                                    "expiresIn": "7d"
                                })
                                User.updateOne({ _id: data.id }, { last_token: token, last_refresh_token: refreshToken }, (err, cb) => {
                                    if(!err) {
                                        res.status(200).json({
                                            error: false,
                                            message: 'Authenticated',
                                            token: token,
                                            refresh_token: refreshToken
                                        })
                                    } else {
                                        res.status(500).json({
                                            error: true,
                                            error_msg: err
                                        })
                                    }
                                })
                            } else {
                                res.status(401).json({
                                    error: true,
                                    error_msg: 'Wrong credentials'
                                })
                            }
                        } else {
                            console.log(err)
                            res.status(401).json({
                                error: true,
                                error_msg: err
                            })
                        }
                    })
                } else {
                    res.status(404).json({
                        error: true,
                        error_msg: "No user found by provided credentials"
                    })
                }
            })
            .catch(err => {
                console.log(err)
                res.status(500).json({
                    error: true,
                    error_msg: err
                })
            })

    } else {
        res.status(400).json({
            error: true,
            error_msg: 'Not enough data provided'
        })
    }
}

function getUsersAllPets(req, res, next) {
    const userId = req.params.userId

    if (userId !== undefined) {
        Pet.find({ userId:  userId })
            .exec()
            .then(data => {
                res.status(200).json({
                    data
                })
            })
            .catch(err => {
                console.log(err)
                res.status(500).json({
                    error: true,
                    error_msg: err
                })
            })
    } else {
        res.status(400).json({
            error: true,
            error_msg: 'Not enough data provided'
        })
    }
}

function userAddPet(req, res, next) {
    const userId = req.params.userId
    const name = req.body.name
    const birthDate = req.body.birthDate
    const code = req.body.code

    if (userId !== undefined && name !== undefined) {
        Collar.findOne({ code: code })
            .exec()
            .then((result) => {
                Pet.findOne({ collarId: result.id })
                    .then((data) => {
                        if (!data) {
                            const pet = new Pet({
                                _id: new mongoose.Types.ObjectId,
                                collarId: result._id,
                                userId: userId,
                                name: name,
                                birthDate: birthDate || ''
                            })

                            pet.save()
                                .then(result => {
                                    res.status(201).json({
                                        error: false,
                                        message: 'Pet added to account',
                                        pet: pet
                                    })
                                })
                                .catch(err => {
                                    console.log(err)
                                    res.status(500).json({
                                        error: true,
                                        error_msg: err
                                    })
                                })
                        } else {
                            res.status(409).json({
                                error: true,
                                error_msg: 'This collar is already in use'
                            })
                        }
                    }).catch(err => {
                        console.log(err)
                        res.status(500).json({
                            error: true,
                            error_msg: err
                        })
                    })
            })
            .catch(err => {
                console.log(err)
                res.status(404).json({
                    error: true,
                    error_msg: "Collar with provided code not found"
                })
            })
    } else {
        res.status(400).json({
            error: true,
            error_msg: 'Not enough data provided'
        })
    }
}

function userChangePassword(req, res, next) {
    const userId = req.params.userId
    const old_password = req.body.old_password
    const new_password = req.body.new_password

    if (userId !== undefined && old_password !== undefined && new_password !== undefined) {
        if (old_password !== new_password) {
            User.findById(userId)
                .exec()
                .then(data => {
                    bcrypt.compare(old_password, data.password, (err, result) => {
                        if (result && !err) {
                            bcrypt.hash(new_password, 10, (err, hash) => {
                                if (!err) {
                                    User.updateOne({_id: userId}, { password: hash })
                                        .exec()
                                        .then(() => {
                                            res.status(200).json({
                                                error: false,
                                                message: "Password has been changed"
                                            })
                                        })
                                        .catch(err => {
                                            res.status(500).json({
                                                error: true,
                                                error_msg: err
                                            })
                                        })
                                } else {
                                    res.status(500).json({
                                        error: true,
                                        error_msg: err
                                    })
                                }
                            })
                        } else {
                            res.status(500).json({
                                error: true,
                                error_msg: err
                            })
                        }
                    })
                })
                .catch(err => {
                    console.log(err)
                    res.status(404).json({
                        error: true,
                        error_msg: err
                    })
                })
        } else {
            res.status(400).json({
                error: true,
                error_msg: 'Passwords are the same'
            })
        }
    } else {
        res.status(400).json({
            error: true,
            error_msg: 'Not enough data provided'
        })
    }
}

function refresh_token(req, res, next) {
    const token = req.body.token
    const refresh_token = req.body.refresh_token

    if (token !== undefined && refresh_token !== undefined) {
        jwt.verify(refresh_token, process.env.JWT_SECRET_REFRESH, (err, decoded) => {
            if (!err) {
                User.findById(decoded.userId)
                    .exec()
                    .then((data) => {
                        if (token === data.last_token && refresh_token === data.last_refresh_token) {
                            const new_token = jwt.sign({
                                    userId: data._id
                                },
                                process.env.JWT_SECRET,
                                {
                                    "expiresIn": "30m"
                                })

                            const new_refresh_token = jwt.sign({
                                    userId: data._id
                                },
                                process.env.JWT_SECRET_REFRESH,
                                {
                                    "expiresIn": "7d"
                                })

                            User.updateOne({ _id: data._id}, { last_token: new_token, last_refresh_token: new_refresh_token })
                                .exec()
                                .then(() => {
                                    res.status(200).json({
                                        error: false,
                                        new_token: new_token,
                                        new_refresh_token: new_refresh_token
                                    })
                                })
                                .catch(err => {
                                    res.status(500).json({
                                        error: true,
                                        error_msg: err
                                    })
                                })

                        } else {
                            res.status(401).json({
                                error: true,
                                error_msg: 'Token refresh failed'
                            })
                        }
                    })
                    .catch(() => {
                        res.status(404).json({
                            error: true,
                            error_msg: 'User with provided token not found'
                        })
                    })
            } else {
                res.status(401).json({
                    error: true,
                    error_msg: 'Token refresh failed'
                })
            }
        })
    } else {
        res.status(400).json({
            error: true,
            error_msg: 'Not enough data provided'
        })
    }
}

module.exports = router