require('dotenv').config();
const express = require('express');
const multer = require('multer');
const axios = require('axios');
const Clarifai = require('clarifai');
const sharp = require('sharp');
const path = require('path');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const clarifaiApp = new Clarifai.App({ apiKey: process.env.CLARIFAI_API_KEY });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Import routes
const authRoutes = require('./routes/auth');

// Use the auth routes at the root level
app.use('/', authRoutes);

// Routes
app.use('/', require('./routes/index'));

//app.use('/login', require('./routes/auth'));
//app.use('/signup', require('./routes/auth'));
app.use('/bmi', require('./routes/bmi'));
app.use('/calorie', require('./routes/calorie'));
app.use('/progress', require('./routes/progress'));
app.use('/workout', require('./routes/workout'));

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
