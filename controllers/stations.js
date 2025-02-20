const stationsRouter = require('express').Router()
const auth = require('../middlewares/auth')
const Station = require('../models/Station')
const tryCatch = require('./utils/tryCatch')
const sentimentAnalyzer = require('../models_trained/sentimentAnalysis')

console.log('JWT_SECRET is set:', !!process.env.JWT_SECRET);

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

stationsRouter.post('/test-sentiment', tryCatch(async (req, res) => {
  const { text } = req.body;
  
  // Add input validation
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Valid text input is required'
    });
  }

  try {
    const result = await sentimentAnalyzer.analyze(text);
    
    // Validate analysis result
    if (!result || !result.sentiment) {
      throw new Error('Invalid analysis result');
    }

    // Format response
    const formattedResult = {
      sentiment: result.sentiment,
      confidence: result.confidence,
      probabilities: result.probabilities
    };

    res.status(200).json({
      success: true,
      text: text,
      analysis: formattedResult
    });
  } catch (error) {
    console.error('Sentiment analysis error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Analysis failed'
    });
  }
}));

stationsRouter.post('/:id/feedback', auth, tryCatch(async (req, res) => {
  console.log('Received token:', req.headers.authorization);
  const { id } = req.params
  const { text, rating } = req.body
  const { id: userId, name: userName } = req.user

  if (!text || !rating) {
    return res.status(400).json({
      success: false,
      message: 'Both text and rating are required'
    })
  }

  try {
    // Analyze sentiment
    const sentimentResult = await sentimentAnalyzer.analyze(text)

    const newFeedback = {
      text,
      rating,
      sentiment: sentimentResult.sentiment,
      confidence: sentimentResult.confidence,
      userId,
      userName,
    }

    const station = await Station.findById(id)
    if (!station) {
      return res.status(404).json({
        success: false,
        message: 'Station not found'
      })
    }

    // Add feedback and update average rating
    station.feedback.push(newFeedback)
    station.totalRatings += 1
    station.averageRating = (
      (station.averageRating * (station.totalRatings - 1) + rating) / 
      station.totalRatings
    ).toFixed(1)

    await station.save()

    res.status(200).json({
      success: true,
      result: station
    })
  } catch (error) {
    console.error('Feedback submission error:', error)
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}))

module.exports = stationsRouter
