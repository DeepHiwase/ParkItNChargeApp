const mongoose = require('mongoose')

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
  },
  { timestampS: true }
)

const Station = mongoose.model('stations', stationSchema)

module.exports = Station