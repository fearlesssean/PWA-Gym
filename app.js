import { IndexedDBManager } from "./IndexedDBManager.js";
import { showToast } from "./toast.js";
import { createForm } from "./form.js";
import { getAllData } from "./logs.js";
import { registerServiceWorker } from "./sw.js";
import { WorkoutXPManager } from './ranking.js';

// Initialized data base
const dbManager = new IndexedDBManager("WorkoutDB", "logs");
dbManager.init().then(() => console.log("Database initialized"));

// Get Element id's
const workoutContainer = document.getElementById('workout-container');
const subtitle = document.getElementById('subtitle');
const savedCycleElement = document.getElementById('saved_cycle');
const savedDayElement = document.getElementById('saved_day');
const savedBenchMaxElement = document.getElementById('saved_bench_max');
const savedSquatMaxElement = document.getElementById('saved_squat_max');
const strengthElement = document.getElementById('strength');
const dataList = document.getElementById('dataList');
const level = document.getElementById('level');
const rank = document.getElementById('rank');
const levelBar = document.getElementById('level-progress-bar');
const levelBarText = document.getElementById('level-progress-bar-text');
const rankBar = document.getElementById('rank-progress-bar');
const rankBarText = document.getElementById('rank-progress-bar-text');

// Load saved data on page load
const savedBenchMax = local_load('benchMax', 45);
const savedSquatMax = local_load('squatMax', 45);
const savedCycle = local_load('cycle', 'A1');
const savedDay = local_load('day', 'Monday');

// Get buttons
const cycleBtn = document.getElementById('cycle-btn');
const logsBtn = document.getElementById('logs-btn');
const toastBtn = document.getElementById('toast-btn');
const completeBtn = document.getElementById('complete-btn');
const calculateBtn = document.getElementById('calculate-btn');

// Local save buttons    
local_save('saveBenchBtn', 'bench-max', 'benchMax', 'Bench Max was updated');
local_save('saveSquatBtn', 'squat-max', 'squatMax', 'Squat Max was updated');
local_save('day-btn', 'select-day', 'day', 'Day was updated');
local_save('cycle-btn', 'select-cycle', 'cycle', 'Cycle was updated');

const xpManager = new WorkoutXPManager();
const { currentLevel, progressToNextLevel, currentRank , progressToNextRank} = xpManager.getLevelAndProgress();


// Local load function
function local_load(item, default_value) {
    return localStorage.getItem(item) || default_value;
}

// Local save function
function local_save(btn_id, value_id, item, toast) {
    const btn = document.getElementById(btn_id)
    if (!btn) {
        return;
    }
    btn.addEventListener('click', () => {
        const input_value = document.getElementById(value_id).value;
        localStorage.setItem(item, input_value);
        showToast(toast, 'New Status!');
    });
}

// Display saved data
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
if (subtitle) {
    subtitle.innerHTML = `<p>DAY: ${savedDay}</p><p>CYCLE: ${savedCycle}</p>`;
}
if (savedCycleElement) {
    savedCycleElement.innerHTML = savedCycle;
}
if (savedDayElement) {
    savedDayElement.innerHTML = savedDay;
}
if (savedBenchMaxElement) {
    savedBenchMaxElement.innerHTML = `BENCH MAX: ${savedBenchMax}`;
}
if (savedSquatMaxElement) {
    savedSquatMaxElement.innerHTML = `SQUAT MAX: ${savedSquatMax}`;
}
if (strengthElement) {
    strengthElement.innerHTML = `${parseInt(savedBenchMax) + parseInt(savedSquatMax)}` || 45;
}
if (level) {
    level.innerHTML = currentLevel;
}
if (rank) {
    rank.textContent = currentRank;
    console.log(currentRank);
}
if (levelBar) {
    levelBar.style.width = `${progressToNextLevel}%`;
    levelBarText.textContent = `${progressToNextLevel}%`;
}
if (rankBar) {
    rankBar.style.width = `${progressToNextRank}%`;
    rankBarText.textContent = `${progressToNextRank}%`;
}
// Calculate Max
if (calculateBtn) {
    calculateBtn.addEventListener('click', () => {
        const weight_input = document.getElementById('weight-input').value;
        const reps_input = document.getElementById('reps-input').value;
        let max = Math.round(weight_input * (1 + (reps_input / 30)));
        max = Math.round(max / 5) * 5;
        document.getElementById('max-output').innerHTML = `${max}.lbs`;
    });
}

window.onload = () => {
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
            const cycleKeys = Object.keys(data.cycles);
            const dayKeys = Object.keys(data.workouts);
            if (completeBtn) {
                completeBtn.addEventListener('click', () => {
                    let next_cycle = cycleKeys[(cycleKeys.indexOf(savedCycle) + 1) % cycleKeys.length];
                    let next_day = dayKeys[(dayKeys.indexOf(savedDay) + 1) % dayKeys.length];
                    if (savedDay == 'Friday') {
                        localStorage.setItem("cycle", next_cycle);
                    }
                    localStorage.setItem("day", next_day);
                    showToast('Workout completed!', 'New Status!');
                    location.reload(); 
                });
            }
            if (cycleBtn) {
                // Get the keys of the cycles object

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
            }
            if (workoutContainer) {
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
            }
        })
        .catch(error => {
            console.error('Error fetching JSON:', error);
        });
}

// Initialize database and fetch data
if (dataList) {
    dataList.innerHTML = '<div class="card card-body"><p>Loading...</p></div>';
    dbManager.init().then(() => {
        try {
            getAllData(dbManager, dataList);
        } catch (error) {
            console.error('Error calling getAllData:', error);
        }
    });
}

// Ensure the correct base path for service worker registration
let url_path = '/';
if (window.location.pathname.includes('/PWA-Gym/')) {
    url_path = '/PWA-Gym/';
    registerServiceWorker(url_path);
}