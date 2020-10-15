const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const User = require('../models/user.model')
const Pet = require('../models/pet.model')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
require('dotenv').config()

router.get('/', getAllUsers)
router.post('/register', register)
router.post('/login', login)
router.get('/:id/pets', getUsersAllPets)

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

function register(req, res, next) {
    const username = req.body.username
    const email = req.body.email.toLowerCase()
    const password = req.body.password

    if (username !== undefined && email !== undefined && password !== undefined) {
        User.find({ email: email })
            .exec()
            .then(result => {
                if (result.length === 0) {
                    bcrypt.hash(password, 10, (err, data) => {
                        if (!err) {
                            const user = new User({
                                _id: new mongoose.Types.ObjectId,
                                username: username,
                                email: email,
                                password: data
                            })

                            user.save()
                                .then(result => {
                                    console.log(result)
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
    const userId = req.params.userId;

    if (id !== undefined) {
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

module.exports = router