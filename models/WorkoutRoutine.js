const mongoose = require('mongoose');

// Define a schema for workout routines
const WorkoutRoutineSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    exercises: [
        {
            exercise: {
                type: String,
                required: true
            },
            reps: {
                type: Number,
                required: true
            },
            sets: {
                type: Number,
                required: true
            },
            calories: {
                type: Number,
                required: true
            }
        }
    ]
});

module.exports = mongoose.model('WorkoutRoutine', WorkoutRoutineSchema);
