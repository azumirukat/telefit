// Load environment variables from .env file
require('dotenv').config();

// Required modules
const express = require('express');
const multer = require('multer');
const axios = require('axios');
const Clarifai = require('clarifai');
const sharp = require('sharp');

// Initialize Express app and middleware
const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const clarifaiApp = new Clarifai.App({ apiKey: process.env.CLARIFAI_API_KEY });
const USDA_API_KEY = process.env.USDA_API_KEY;

// Serve static files from 'public' directory
app.use(express.static('public'));

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

    // Use USDA FoodData Central API for nutritional analysis
    const results = [];
    let totalCalories = 0;

    // Function to fetch nutritional info from USDA FoodData Central API
    async function getNutritionalInfo(foodItem) {
      try {
        const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(foodItem)}&api_key=${USDA_API_KEY}`;
        const response = await axios.get(url);

        if (response.data.foods.length > 0) {
          const food = response.data.foods[0];
          const productName = food.description;
          
          // Find calories per 100g
          const caloriesPer100g = food.foodNutrients.find(nutrient => nutrient.nutrientId === 1008)?.amount || 0;

          return {
            productName,
            caloriesPer100g
          };
        } else {
          console.warn(`Product not found for ${foodItem}`);
          return null;
        }
      } catch (error) {
        console.error('Error fetching product details:', error);
        return null;
      }
    }

    // Process each identified food item
    for (const item of foodItems) {
      const nutritionInfo = await getNutritionalInfo(item);
      if (nutritionInfo) {
        const calories = calculateCalories(nutritionInfo.caloriesPer100g);
        totalCalories += calories;
        results.push({
          ingredient: nutritionInfo.productName,
          quantity: '100g', // Assuming 100g for simplicity
          calories: calories
        });
      }
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
