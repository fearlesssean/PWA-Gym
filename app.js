import { IndexedDBManager } from "./IndexedDBManager.js";
import { showToast } from "./toast.js";
import { createForm } from "./form.js";
import { registerServiceWorker } from "./sw.js";

const workoutContainer = document.getElementById('workout-container');
const subtitle = document.getElementById('subtitle');
const dbManager = new IndexedDBManager("WorkoutDB", "logs");
dbManager.init().then(() => console.log("Database initialized"));

window.onload = () => {
    // Load saved data on page load
    const savedBenchMax = parseFloat(localStorage.getItem('benchMax')) || 45;
    const savedSquatMax = parseFloat(localStorage.getItem('squatMax')) || 45;
    const savedCycle = localStorage.getItem('cycle') || 'A1';
    const savedDay = localStorage.getItem('day') || 'Monday';

    // Select workout cycle and day
    const savedayBtn = document.getElementById('day-btn');
    const cycleBtn = document.getElementById('cycle-btn');
    const logsBtn = document.getElementById('logs-btn');
    const toastBtn = document.getElementById('toast-btn');
    const saveBenchBtn = document.getElementById('saveBenchBtn');
    const saveSquatBtn = document.getElementById('saveSquatBtn');

    // Display saved data
    if (subtitle) {
        subtitle.innerHTML = `Cycle: ${savedCycle}, Day: ${savedDay}`;
    }
    if (toastBtn) {
        toastBtn.addEventListener('click', () => {
            showToast('This is a toast test...', 'New Status!');
        });
    }
    if (logsBtn) {
        logsBtn.addEventListener('click', () => {
            dbManager.exportToCSV();
        });
    }
    if (saveBenchBtn) {
        saveBenchBtn.addEventListener('click', () => {
            const input_benchMax = document.getElementById('bench-max').value;
            localStorage.setItem('benchMax', input_benchMax);
            showToast('Bench Max was updated', 'New Status!');
        });
    }
    if (saveSquatBtn) {
        saveSquatBtn.addEventListener('click', () => {
            const input_squatMax = document.getElementById('squat-max').value;
            localStorage.setItem('squatMax', input_squatMax);
            showToast('Squat Max was updated', 'New Status!');
        });
    }

    if (savedayBtn) {
        savedayBtn.addEventListener('click', () => {
            const selectDay = document.getElementById('select-day') || 'Monday';
            localStorage.setItem('day', selectDay.value);
            showToast('Day was updated', 'New Status!');
        });
    }

    // Clear the workout workoutContainer
    if (workoutContainer) {
        workoutContainer.innerHTML = "";
    }
    // Script for form
    fetch('workouts.json') // fetch json file
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (cycleBtn) {
                // Get the keys of the cycles object
                const cycleKeys = Object.keys(data.cycles);

                // Target the <select> element by its ID
                const selectElement = document.getElementById("select-cycle");

                // Loop through the keys to create and append <option> elements
                cycleKeys.forEach(key => {
                    const option = document.createElement("option");
                    option.value = key; // The value attribute of the option
                    option.textContent = key; // The text displayed in the dropdown
                    option.selected = key === savedCycle;
                    selectElement.appendChild(option);
                });

                // SAVE - Action for when CycleBtn clicked
                cycleBtn.addEventListener('click', () => {
                    const selectCycle = document.getElementById('select-cycle') || 'A1';
                    localStorage.setItem('cycle', selectCycle.value);
                    showToast('Cycle was updated', 'New Status!');
                });
            }
            // Access the cycles workout
            const workoutCycles = data.cycles[savedCycle];

            // Access the day workout
            const selectedWorkout = data.workouts[savedDay];

            // Create form for selected cycle
            if (savedDay == 'Monday') {
                createForm(workoutCycles, savedBenchMax, 'Bench', workoutContainer, dbManager);
            }
            else if (savedDay == 'Friday') {
                createForm(workoutCycles, savedSquatMax, 'Squat', workoutContainer, dbManager);
            }

            // Loop through each exercise in selectedWorkout
            for (const exerciseKey in selectedWorkout) {
                const exercise = selectedWorkout[exerciseKey];
                createForm(exercise, null, null, workoutContainer, dbManager);
            };
        })
        .catch(error => {
            console.error('Error fetching JSON:', error);
        });
    // Add Data to IndexedDB
    function addData(formId) {
        const fields = ["title", "set1", "set2", "set3", "set4", "set5", "set6"];
        const data = {};

        fields.forEach((field) => {
            const element = document.querySelector(`#${formId} [name="${field}"]`);
            if (element) {
                const value = field === "title" ? element.value : parseInt(element.value, 10);
                if (field === "title" || !isNaN(value)) {
                    data[field] = value;
                }
            }
        });

        // Add a timestamp to the data object
        data.timestamp = new Date().toISOString(); // ISO 8601 formatted timestamp

        dbManager.add(data).then((id) => {
            showToast(`Workout saved! ${new Date(data.timestamp).toLocaleString()}`, `New Status!`);
            console.log(`Data added with ID: ${id} and timestamp: ${data.timestamp}`);
        });
    }

    // Button actions
    async function getWorkoutTitle(title, set) {
        const data = await dbManager.getAll();
        if (data.length === 0) {
            console.log("No data");
            return null;
        }
        const matchingItem = data.find(item => item.title === title);
        return matchingItem ? matchingItem[set] || null : null;
    }
    getAllData();
}

function deleteData(dataID) {
    dataID = parseInt(dataID, 10);
    dbManager.delete(dataID).then(() => {
        console.log(`Data with ID ${dataID} deleted`);
    });
}

function getAllData() {
    // Check if we're on the account.html page
    if (window.location.pathname.includes('logs.html')) {
        dbManager.getAll().then((data) => {
            const dataList = document.getElementById('dataList');

            if (data.length === 0) {
                dataList.innerHTML = '<div class="card card-body"><p>No workout logs saved..</p></div>';
                return;
            }

            // Clear existing content
            dataList.innerHTML = '';

            // Fetch `workouts.json` to get the reps data
            fetch('workouts.json')
                .then((response) => response.json())
                .then((workouts) => {
                    // Create and append user elements
                    data.forEach((item) => {
                        // Normalize title for lookup
                        let strippedTitle;
                        if (item.title === "Bench MAX" || item.title === "Squat MAX") {
                            strippedTitle = "MAX"; // Normalize to match JSON key
                        } else {
                            // Strip everything before the two letters (e.g., "Bench A1" -> "A1")
                            strippedTitle = item.title.replace(/.*\s([A-Z]\d{1,2})$/, '$1');
                        }

                        // Extract reps from either "cycles" or "workouts" based on the stripped title
                        let reps = [];
                        if (workouts.cycles[strippedTitle]) {
                            reps = workouts.cycles[strippedTitle].reps;
                        } else {
                            // Search in each day's workouts
                            Object.values(workouts.workouts).some(dayWorkouts => {
                                const workout = Object.values(dayWorkouts).find(w => w.title === item.title);
                                if (workout) {
                                    reps = workout.reps;
                                    return true; // Stop searching once found
                                }
                                return false;
                            });
                        }

                        // Graceful fallback if no reps are found
                        if (!reps.length) {
                            console.warn(`Reps not found for workout: ${item.title}`);
                            reps = Array(6).fill('-'); // Default placeholder
                        }

                        // Create readable date and time
                        const date = new Date(item.timestamp).toLocaleString(); // e.g., "1/13/2025, 12:34:56 PM"

                        // Create a container for the log entry
                        const logsDiv = document.createElement('div');
                        logsDiv.classList.add('log-entry', 'card', 'mb-2', 'px-5', 'pe-5');

                        // Build the content dynamically
                        const sets = [];
                        for (let i = 1; i <= reps.length; i++) {
                            if (item[`set${i}`]) {
                                sets.push(`
                                <li class="list-group-item">
                                    <span class="fw-bold">${reps[i - 1]}X @ </span> ${item[`set${i}`]} lbs
                                </li>
                            `);
                            }
                        }

                        // Set the inner HTML for the log entry
                        logsDiv.innerHTML = `
                        <div class="card-body">
                            <h2>${item.title}</h2>
                            <p class="card-text"><span class="fw-bold">${date}</span></p>
                        </div>
                        <ul class="text-start p-3">
                            ${sets.join('<hr>')}
                        </ul>
                        <div class="card-body text-end">
                            <button class="delete-btn btn btn-l" data-id="${item.id}">
                                <i class="bi bi-trash"></i> Delete
                            </button>
                        </div>
                    `;

                        // Append the log entry to the data list
                        dataList.appendChild(logsDiv);

                        // Add event listener for delete
                        const deleteButton = logsDiv.querySelector('.delete-btn');
                        deleteButton.addEventListener('click', () => {
                            showToast(`Workout deleted!`, `New Status!`);
                            const idToDelete = deleteButton.getAttribute('data-id');
                            deleteData(idToDelete); // Call your delete function with the ID
                            getAllData();
                        });
                    });
                })
                .catch((err) => {
                    console.error('Error fetching workouts.json:', err);
                    dataList.innerHTML = '<div class="card card-body"><p>Error loading workouts. Please try again.</p></div>';
                });
        });
    }
}
// Ensure the correct base path for service worker registration
let url_path = '/';
if (window.location.pathname.includes('/PWA-Gym/')) {
    url_path = '/PWA-Gym/';
    registerServiceWorker(url_path);
}


