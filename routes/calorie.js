const express = require('express');
const sharp = require('sharp');
const axios = require('axios');
const Clarifai = require('clarifai');
const multer = require('multer');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/calorie', (req, res) => {
    res.render('base', { title: 'Calorie Calculator', content: 'calorie-calculator'});
});

// Initialize Clarifai app
const clarifaiApp = new Clarifai.App({ apiKey: process.env.CLARIFAI_API_KEY });

// Helper function to preprocess image
async function preprocessImage(buffer) {
  return await sharp(buffer)
    .resize(500, 500) // Resize for consistency
    .normalize() // Normalize brightness and contrast
    .toBuffer();
}

// Function to analyze image and recognize food items
async function analyzeImage(buffer) {
  const preprocessedImage = await preprocessImage(buffer);
  const base64Image = preprocessedImage.toString('base64');

  // Use Clarifai for food recognition
  const clarifaiResponse = await clarifaiApp.models.predict(Clarifai.FOOD_MODEL, { base64: base64Image });
  const foodItems = clarifaiResponse.outputs[0].data.concepts
    .filter(concept => concept.value > 0.97) // Apply confidence threshold
    .map(concept => concept.name);

  return foodItems;
}

// Function to get nutritional info from Edamam API
async function getNutritionalInfo(foodItem) {
  const url = `https://api.edamam.com/api/nutrition-data?app_id=${process.env.EDAMAM_APP_ID}&app_key=${process.env.EDAMAM_APP_KEY}&ingr=${encodeURIComponent('100g ' + foodItem)}`;
  const response = await axios.get(url);
  return response.data;
}

// Function to calculate calories based on assumed portion size
function calculateCalories(caloriesPer100g) {
  // Assuming 100g as standard portion
  return caloriesPer100g;
}

// Route to handle image upload and food analysis
router.post('/analyze', upload.single('image'), async (req, res) => {
  try {
    // Analyze the uploaded image
    const foodItems = await analyzeImage(req.file.buffer);

    // Use Edamam for nutritional analysis
    const results = [];
    let totalCalories = 0;

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

// Export the router
module.exports = router;
