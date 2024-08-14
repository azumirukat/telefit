require('dotenv').config();
const express = require('express');
const cookieSession = require('cookie-session');
const multer = require('multer');
const axios = require('axios');
const Clarifai = require('clarifai');
const mongoose = require('mongoose');
const sharp = require('sharp');
const path = require('path');
const connectDB = require('./db');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const clarifaiApp = new Clarifai.App({ apiKey: process.env.CLARIFAI_API_KEY });

// Connect to MongoDB
connectDB();

// Set up session management - this should be done before defining any routes
app.use(cookieSession({
  name: 'session',
  keys: [process.env.SESSION_SECRET || 'TeleFit'], // Secret keys for signing cookies
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

// Middleware for parsing requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to make session data available to all views
app.use((req, res, next) => {
  // Store session information in res.locals
  res.locals.user = req.session.user|| null; // User ID from session
  res.locals.userInfo = req.session.userInfo || null; // Other user info if stored
  next();
});

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Import routes
// Ensure session middleware is set before these routes
app.use('/', require('./routes/auth'));
app.use('/', require('./routes/index'));
app.use('/', require('./routes/bmi'));
app.use('/', require('./routes/calorie'));
app.use('/', require('./routes/progress'));
app.use('/', require('./routes/workout'));

// Helper function to preprocess image
async function preprocessImage(buffer) {
  return await sharp(buffer)
    .resize(500, 500) // Resize for consistency
    .normalize() // Normalize brightness and contrast
    .toBuffer();
}

// POST route to handle image upload and food analysis
app.post('/analyze', upload.single('image'), async (req, res) => {
  try {
    // Preprocess the uploaded image
    const preprocessedImage = await preprocessImage(req.file.buffer);
    const base64Image = preprocessedImage.toString('base64');

    // Use Clarifai for food recognition
    const clarifaiResponse = await clarifaiApp.models.predict(Clarifai.FOOD_MODEL, { base64: base64Image });
    const foodItems = clarifaiResponse.outputs[0].data.concepts
      .filter(concept => concept.value > 0.85) // Apply confidence threshold
      .map(concept => concept.name);

    // Use Edamam for nutritional analysis
    const results = [];
    let totalCalories = 0;

    // Function to get nutritional info from Edamam API
    async function getNutritionalInfo(foodItem) {
      const url = `https://api.edamam.com/api/nutrition-data?app_id=${process.env.EDAMAM_APP_ID}&app_key=${process.env.EDAMAM_APP_KEY}&ingr=${encodeURIComponent('100g ' + foodItem)}`;
      const response = await axios.get(url);
      return response.data;
    }

    // Process each identified food item
    for (const item of foodItems) {
      const nutritionInfo = await getNutritionalInfo(item);
      const caloriesPer100g = nutritionInfo.calories || 0; // Fallback to 0 if calories not found
      const calories = calculateCalories(caloriesPer100g);
      totalCalories += calories;
      results.push({
        ingredient: item,
        quantity: '100g', // Assuming 100g for simplicity
        calories: calories
      });
    }

    // Respond with JSON containing results and total calories
    res.json({ results, totalCalories });
  } catch (error) {
    console.error('Error analyzing image:', error);
    res.status(500).send('Error analyzing image.');
  }
});

// Function to calculate calories based on assumed portion size
function calculateCalories(caloriesPer100g) {
  // Assuming 100g as standard portion
  return caloriesPer100g;
}

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
