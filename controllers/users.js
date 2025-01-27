const usersRouter = require('express').Router()
const User = require('../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const tryCatch = require('./utils/tryCatch')

usersRouter.post(
  '/register',
  tryCatch(async (req, res) => {
    const { name, email, password } = req.body
    if (password.length < 6)
      return res.status(400).json({
        success: false,
        message: 'Password must be 6 characters or more',
      })
    const emailLowerCase = email.toLowerCase()
    const existedUser = await User.findOne({ email: emailLowerCase })
    if (existedUser)
      return res
        .status(400)
        .json({ success: false, message: 'User already exists!' })
    const hashedPassword = await bcrypt.hash(password, 12)
    const user = new User({
      name,
      email: emailLowerCase,
      passwordHash: hashedPassword,
    })
    await user.save()
    await mongoose.connection.close()
    const { _id: id, photoURL } = user
    const token = jwt.sign({ id, name, photoURL }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    })
    res.status(201).json({
      success: true,
      result: { id, name, email: user.email, photoURL, token },
    })
  })
)

usersRouter.post(
  '/login',
  tryCatch(async (req, res) => {
    const { email, password } = req.body
  
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' })
    }
  
    const emailLowerCase = email.toLowerCase()
    const existedUser = await User.findOne({ email: emailLowerCase })
    console.log(existedUser)
    if (!existedUser) {
      return res.status(404).json({ success: false, message: 'User does not exist!' })
    }
  
    console.log(password, existedUser.password)
    const correctPassword = await bcrypt.compare(password, existedUser.passwordHash)
    console.log(correctPassword)
    if (!correctPassword) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' })
    }
  
    const { _id: id, name, photoURL } = existedUser
    const token = jwt.sign({ id, name, photoURL }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    })
  
    res.status(200).json({ success: true, token })
  })
)

module.exports = usersRouter
