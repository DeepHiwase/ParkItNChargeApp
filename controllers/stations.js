const stationsRouter = require('express').Router()
const auth = require('../middlewares/auth')

stationsRouter.post('/', auth, async (req, res) => {
  //testing resource access
  res
    .status(201)
    .json({ success: true, result: { id: 123, title: 'test station' } })
})

module.exports = stationsRouter
