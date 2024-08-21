document.addEventListener("DOMContentLoaded", function () {
  const workoutTableBody = document
    .getElementById("workoutTable")
    .getElementsByTagName("tbody")[0];
  const workoutNameInput = document.getElementById("workout-name");
  const workoutSelector = document.getElementById("workout-selector");

  let currentWorkoutId = null; //keeps track of the current workout ID

  //event listener to load selected workout from dropdown
  workoutSelector.addEventListener("change", function () {
    currentWorkoutId = this.value;
    //console.log(currentWorkoutId);

    if (currentWorkoutId) {
      fetch(`/workout/load?id=${currentWorkoutId}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            workoutNameInput.value = data.workout.name;
            workoutTableBody.innerHTML = "";

            data.workout.exercises.forEach(function (exercise) {
              const row = workoutTableBody.insertRow();
              row.insertCell(
                0
              ).innerHTML = `<input type="text" class="p-2 border border-gray-300 rounded" value="${exercise.exercise}">`;
              row.insertCell(
                1
              ).innerHTML = `<input type="number" class="p-2 border border-gray-300 rounded" value="${exercise.reps}">`;
              row.insertCell(
                2
              ).innerHTML = `<input type="number" class="p-2 border border-gray-300 rounded" value="${exercise.sets}">`;
              row.insertCell(
                3
              ).innerHTML = `<input type="number" class="p-2 border border-gray-300 rounded" value="${exercise.calories}">`;
              row.insertCell(4).innerHTML =
                '<button class="delete-row-btn text-red-500">Delete</button>';

              //add buttons to delete rows from table
              row
                .querySelector(".delete-row-btn")
                .addEventListener("click", function () {
                  row.remove();
                });
            });
          } else {
            alert("Failed to load workout.");
          }
        })
        .catch((error) => {
          console.error("Error loading workout:", error);
        });
    }
  });

  //event listener to create a new workout
  document
    .getElementById("create-workout-btn")
    .addEventListener("click", function () {
      workoutNameInput.value = "";
      workoutTableBody.innerHTML = "";
      workoutSelector.selectedIndex = 0;
      currentWorkoutId = null; //clears the current workout ID when creating a new workout so it does not update a different workout
    });

  //function to add a new exercise row
  document
    .getElementById("add-exercise-btn")
    .addEventListener("click", function () {
      const row = workoutTableBody.insertRow();
      row.insertCell(0).innerHTML =
        '<input type="text" class="p-2 border border-gray-300 rounded" placeholder="Exercise">';
      row.insertCell(1).innerHTML =
        '<input type="number" class="p-2 border border-gray-300 rounded" placeholder="Reps">';
      row.insertCell(2).innerHTML =
        '<input type="number" class="p-2 border border-gray-300 rounded" placeholder="Sets">';
      row.insertCell(3).innerHTML =
        '<input type="number" class="p-2 border border-gray-300 rounded" placeholder="Calories">';
      row.insertCell(4).innerHTML =
        '<button class="delete-row-btn text-red-500">Delete</button>';

      //adds the event listener for the delete button in each row
      row
        .querySelector(".delete-row-btn")
        .addEventListener("click", function () {
          row.remove();
        });
    });

  //function to save the workout
  document
    .getElementById("save-workout-btn")
    .addEventListener("click", function () {
      const workoutName = workoutNameInput.value.trim();
      const exercises = [];
      let valid = true;

      if (!workoutName) {
        alert("Please enter a workout name.");
        return;
      }

      for (let i = 0; i < workoutTableBody.rows.length; i++) {
        const row = workoutTableBody.rows[i];
        const exercise = row.cells[0].children[0].value.trim();
        const reps = row.cells[1].children[0].value.trim();
        const sets = row.cells[2].children[0].value.trim();
        const calories = row.cells[3].children[0].value.trim();

        if (!exercise || !reps || !sets || !calories) {
          valid = false;
          break;
        }

        exercises.push({ exercise, reps, sets, calories });
      }

      if (!valid) {
        alert("Please fill in all exercise fields before saving.");
        return;
      }

      //seends the workout data to the server
      fetch("/workout/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: currentWorkoutId,
          name: workoutName,
          exercises,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            currentWorkoutId = data.workout._id;
            alert("Workout saved successfully!" + currentWorkoutId);
            //refreshes the workout list after saving
            updateWorkoutDropdown();
            workoutSelector.selectedIndex = currentWorkoutId;
          } else {
            alert("Failed to save workout.");
          }
        })
        .catch((error) => {
          console.error("Error saving workout:", error);
        });
    });

  //function to delete the workout
  document
    .getElementById("delete-workout-btn")
    .addEventListener("click", function () {
      if (!currentWorkoutId) {
        alert("Please select a workout to delete.");
        return;
      }

      if (
        confirm(
          "Are you sure you want to delete this workout? This action cannot be undone."
        )
      ) {
        fetch("/workout/delete", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: currentWorkoutId }),
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              alert("Workout deleted successfully!");
              workoutNameInput.value = "";
              workoutTableBody.innerHTML = ""; //clears the table
              currentWorkoutId = null; //clears the current workout ID
              updateWorkoutDropdown(); //refreshes the dropdown list
            } else {
              alert("Failed to delete workout.");
            }
          })
          .catch((error) => {
            console.error("Error deleting workout:", error);
          });
      }
    });

  //function to update the workout dropdown list
  function updateWorkoutDropdown() {
    let index = 0;
    let count = 1;
    fetch("/workout/list")
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          workoutSelector.innerHTML =
            '<option value="" disabled selected>Select a workout</option>';
          data.workouts.forEach(function (workout) {
            const option = document.createElement("option");
            option.value = workout._id;
            option.textContent = workout.name;
            workoutSelector.appendChild(option);

            if (workout._id == currentWorkoutId) {
              index = count;
              //console.log(workout._id + " " + index);
              //console.log(count);
            }

            count++;
          });
          workoutSelector.selectedIndex = index;
          workoutSelector.dispatchEvent(new Event("change")); //trigger the change event to load the new workout
          console.log("There is a current workout id");
        } else {
          alert("Failed to update workout list.");
        }
      })
      .catch((error) => {
        console.error("Error updating workout list:", error);
      });
  }
});
