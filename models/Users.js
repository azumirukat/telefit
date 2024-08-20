const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        sparse: true
    },
    password: {
        type: String
    },
    telegramId: {
        type: String,
        unique: true,
        sparse: true
    },
    userName: {
        type: String
    },
    workoutRoutines: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'WorkoutRoutine'
        }
    ]
});

module.exports = mongoose.model('User', UserSchema);
