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
    res.status(201).json({ success: true, result: newStation })
  })
)

stationsRouter.get(
  '/',
  tryCatch(async (req, res) => {
    const stations = await Station.find({}).sort({ _id: -1 }) //sorted by adding new one to old one
    res.status(200).json({ success: true, result: stations })
  })
)

module.exports = stationsRouter
