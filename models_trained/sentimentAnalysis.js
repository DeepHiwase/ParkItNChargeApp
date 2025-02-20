const natural = require('natural');
const fs = require('fs');
const path = require('path');

class SentimentAnalyzer {
  constructor() {
    this.classifier = new natural.BayesClassifier();
    this.modelPath = path.join(__dirname, '../models/sentiment_model.json');
    this.trainingDataPath = path.join(__dirname, '../data/feedback_training.json');
    this.trained = false;
  }

  validateModel() {
    if (!this.trained || !this.classifier) {
      throw new Error('Model not properly initialized');
    }
    return true;
  }

  // Add error logging
  logError(method, error) {
    console.error(`SentimentAnalyzer ${method} error:`, error);
    // You could add more sophisticated logging here
  }

  // Add method to check training data
  async validateTrainingData(data) {
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Invalid training data format');
    }
    return true;
  }

  async loadTrainingData() {
    try {
      const data = await fs.promises.readFile(this.trainingDataPath, 'utf8');
      return JSON.parse(data).feedback;
    } catch (error) {
      console.error('Error loading training data:', error);
      throw new Error('Failed to load training data');
    }
  }

  async train() {
    if (this.trained) return;

    try {
      // Try to load existing model
      if (fs.existsSync(this.modelPath)) {
        const modelData = await fs.promises.readFile(this.modelPath, 'utf8');
        this.classifier = natural.BayesClassifier.restore(JSON.parse(modelData));
        this.trained = true;
        console.log('Loaded existing model');
        return;
      }

      // Train new model if no existing model found
      const trainingData = await this.loadTrainingData();
      
      console.log('Training new model with', trainingData.length, 'examples');
      
      trainingData.forEach(({ text, rating }) => {
        const sentiment = this.getRatingCategory(rating);
        const processedText = this.preprocessText(text);
        this.classifier.addDocument(processedText, sentiment);
      });

      this.classifier.train();
      this.trained = true;

      // Save the trained model
      const modelData = JSON.stringify(this.classifier);
      await fs.promises.writeFile(this.modelPath, modelData);
      console.log('Model trained and saved successfully');

    } catch (error) {
      console.error('Error training model:', error);
      throw new Error('Failed to train sentiment model');
    }
  }

  preprocessText(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .replace(/\s+/g, ' ')    // Normalize whitespace
      .trim();
  }

  getRatingCategory(rating) {
    if (rating <= 2) return 'negative';
    if (rating <= 3) return 'neutral';
    return 'positive';
  }

  analyze(text) {
    if (!this.trained) {
      throw new Error('Model not trained');
    }
    const processedText = this.preprocessText(text);
    const classification = this.classifier.classify(processedText);
    const probabilities = this.classifier.getClassifications(processedText);
    
    return {
      sentiment: classification,
      confidence: probabilities[0].value,
      probabilities
    };
  }

  async retrain() {
    this.trained = false;
    await this.train();
  }
}

// Create singleton instance
const analyzer = new SentimentAnalyzer();

// Initialize the analyzer when the service is first required
(async () => {
  try {
    await analyzer.train();
    console.log('Sentiment analyzer initialized successfully');
  } catch (error) {
    console.error('Failed to initialize sentiment analyzer:', error);
  }
})();

module.exports = analyzer;