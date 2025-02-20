const express = require('express')
require('dotenv').config()
const cors = require('cors')
const stationsRouter = require('./controllers/stations')
const errorHandler = require('./middlewares/errorHandler')
const unknownEndpoint = require('./middlewares/unknownEndpoint')
const requestLogger = require('./middlewares/requestLogger')
const mongoose = require('mongoose')
const userRouter = require('./controllers/users')

const port = process.env.PORT || 3001
const app = express()

app.use(cors())
app.use(express.static('./dist'))
app.use(express.json({ limit: '10mb' }))
app.use(requestLogger)
app.use('/api/users', userRouter)
app.use('/api/stations', stationsRouter)
// app.get('/', (req, res) => res.json({ message: 'Welcome to our API' }))

app.use(unknownEndpoint)
app.use(errorHandler)

const startServer = async () => {
  try {
    mongoose.connect(process.env.MONGODB_URI)
    app.listen(port, () => console.log(`Server is listening on port: ${port}`))
  } catch (error) {
    console.log(error)
  }
}

startServer()
