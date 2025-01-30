const stationsRouter = require('express').Router()
const { default: mongoose } = require('mongoose')
const auth = require('../middlewares/auth')
const Station = require('../models/Station')
const tryCatch = require('./utils/tryCatch')

stationsRouter.post(
  '/',
  auth,
  tryCatch(async (req, res) => {
    const { id: uid, name: uName, photoURL: uPhoto } = req.user
    const newStation = new Station({ ...req.body, uid, uName, uPhoto })
    await newStation.save()
    mongoose.connection.close()
    res.status(201).json({ success: true, result: newStation })
  })
)

module.exports = stationsRouter
