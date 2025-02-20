const mongoose = require('mongoose')

const feedbackSchema = mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  sentiment: {
    type: String,
    enum: ['positive', 'neutral', 'negative']
  },
  confidence: Number,
  createdAt: {
    type: Date,
    default: Date.now
  },
  userId: String,
  userName: String
})

const stationSchema = mongoose.Schema(
  {
    lng: { type: Number, required: true },
    lat: { type: Number, required: true },
    price: { type: Number, min: 0, max: 50, default: 10 },
    name: { type: String, required: true, minLength: 5, maxLength: 150 },
    description: {
      type: String,
      required: true,
      minLength: 10,
      maxLength: 1000,
    },
    images: { type: [String], validate: (v) => Array(v) && v.length > 0 },
    uid: { type: String, required: true },
    uName: { type: String, required: true },
    uPhoto: { type: String, default: '' },
    feedback: [feedbackSchema],
    averageRating: {
      type: Number,
      default: 0
    },
    totalRatings: {
      type: Number,
      default: 0
    }
  },
  { timestampS: true }
)

const Station = mongoose.model('stations', stationSchema)

module.exports = Station