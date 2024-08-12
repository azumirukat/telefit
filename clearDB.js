const mongoose = require('mongoose');
const User = require('./models/Users'); // Ensure the correct path to your User model

// Connect to MongoDB
mongoose.connect('mongodb+srv://TeleFit:TeleFitPassword@telefit.6hgip.mongodb.net/?retryWrites=true&w=majority&appName=TeleFit')
    .then(() => {
        console.log('MongoDB Connected...');

        // Clear the User collection
        return User.deleteMany({});
    })
    .then(() => {
        console.log('All users deleted');
        mongoose.connection.close(); // Close the connection after operation
    })
    .catch(err => {
        console.error('Error clearing users:', err);
    });
