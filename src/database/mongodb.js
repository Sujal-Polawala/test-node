const mongoose = require('mongoose');
const { APIError } = require('../utils/error');

const MONGODB_URI ='mongodb://localhost:27017/weather';
async function initializeDB() {
  try {
    if (mongoose.connection.readyState === 1) {
      console.log('MongoDB already connected.');
      return;
    }
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully.');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    throw new APIError(500, err?.message, null, err?.stack);
  }
}

module.exports = {
  initializeDB,
};
