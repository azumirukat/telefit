const express = require("express");
const router = express.Router();
const User = require("../models/Users");
const WorkoutRoutine = require('../models/WorkoutRoutine');


// Route to fetch workout routines for the logged-in user
router.get("/workout", async (req, res) => {
  try {
    // Retrieve the userId from the session object
    const userId = req.session.user._id;

    if (!userId) {
      return res.status(400).send("User not authenticated");
    }

    // Find the user by their ID and populate workout routines
    const user = await User.findById(userId).populate("workoutRoutines");
    if (!user) {
      return res.status(404).send("User not found");
    }

    // Render the workout page with the user's workout routines
    res.render("base", {
      title: "Workout Routines",
      content: "workout",
      workouts: user.workoutRoutines || [],
    });

  } catch (error) {
    console.error("Error fetching workout routines:", error);
    res.status(500).send("Server error");
  }
});

// Route to fetch the list of workouts for the current user
router.get('/workout/list', async (req, res) => {
    try {
        const userId = req.session.user._id; // Assuming the user ID is stored in the session
        const user = await User.findById(userId).populate('workoutRoutines').exec();

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, workouts: user.workoutRoutines });
    } catch (error) {
        console.error('Error fetching workout list:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.post('/workout/save', async (req, res) => {
    console.log("Save button pressed");
    try {
        const userId = req.session.user._id;
        const { id, name, exercises } = req.body;

        if (!userId || !name || !exercises || exercises.length === 0) {
            return res.status(400).json({ success: false, message: 'Invalid input' });
        }

        let routine;
        if (id) {
            // Update existing workout
            routine = await WorkoutRoutine.findByIdAndUpdate(id, { name, exercises }, { new: true });
        } else {
            // Create a new workout
            routine = new WorkoutRoutine({ name, exercises });
            await routine.save();

            // Associate the new routine with the user
            const user = await User.findById(userId);
            user.workoutRoutines.push(routine._id);
            await user.save();
        }

        // Respond with the success status and the routine's ID
        res.json({ success: true, workout: routine });
    } catch (error) {
        console.error('Error saving workout:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});


// Route to load a specific workout
router.get('/workout/load', async (req, res) => {
    try {
        const userId = req.session.user._id;
        const workoutId = req.query.id;

        if (!userId || !workoutId) {
            return res.status(400).json({ success: false, message: 'Invalid input' });
        }

        const workout = await WorkoutRoutine.findById(workoutId);

        if (!workout) {
            return res.status(404).json({ success: false, message: 'Workout not found' });
        }

        res.json({ success: true, workout });
    } catch (error) {
        console.error('Error loading workout:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Route to delete a specific workout
router.post('/workout/delete', async (req, res) => {
    try {
        const userId = req.session.user._id;
        const workoutId = req.body.id;

        if (!userId || !workoutId) {
            return res.status(400).json({ success: false, message: 'Invalid input' });
        }

        const workout = await WorkoutRoutine.findByIdAndDelete(workoutId);

        if (!workout) {
            return res.status(404).json({ success: false, message: 'Workout not found' });
        }

        // Remove the workout from the user's workoutRoutines array
        await User.findByIdAndUpdate(userId, {
            $pull: { workoutRoutines: workoutId }
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting workout:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});



module.exports = router;
