// import IndexedDB Manager
import { IndexedDBManager } from "./IndexedDBManager.js";

const workoutContainer = document.getElementById('workout-container');
const subtitle = document.getElementById('subtitle');
const dbManager = new IndexedDBManager("WorkoutDB", "logs");
dbManager.init().then(() => console.log("Database initialized"));

window.onload = () => {
    // Load saved data on page load
    const savedBenchMax = localStorage.getItem('benchMax') || 45;
    const savedSquatMax = localStorage.getItem('squatMax') || 45;
    const savedCycle = localStorage.getItem('cycle') || 'A1';
    const savedDay = localStorage.getItem('day') || 'Monday';
    // Initialize the database

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

            function createForm(exercise, selectedMax, addTitle) {
                const col = document.createElement('div');
                col.classList.add('col-md-6');

                const card = document.createElement('div');
                card.classList.add('card', 'shadow-sm');

                const cardBody = document.createElement('div');
                cardBody.classList.add('card-body');

                let exerciseTitle = exercise.title;

                if (addTitle != null) {
                    exerciseTitle = `${addTitle} ${exercise.title}`;
                }

                const cardTitle = document.createElement('h2');
                cardTitle.textContent = exerciseTitle;
                cardBody.appendChild(cardTitle);

                const form = document.createElement('form');
                const formId = exerciseTitle.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase();
                form.id = formId;

                // create hidden title input
                const inputTitle = document.createElement('input');
                inputTitle.type = 'text';
                inputTitle.name = 'title';
                inputTitle.value = exerciseTitle;
                inputTitle.hidden = true;

                let i = 0;
                for (const rep in exercise.reps) {
                    const formGroup = document.createElement('div');
                    formGroup.classList.add('mb-3');

                    const inputGroup = document.createElement('div');
                    inputGroup.classList.add('input-group', 'mt-2');

                    const span1 = document.createElement('span');
                    span1.textContent = `${exercise.reps[rep]} x`;
                    span1.classList.add('input-group-text');

                    const input = document.createElement('input');
                    input.type = 'number';
                    input.name = `set${i + 1}`;
                    input.classList.add('form-control');
                    input.required = true;
                    input.min = 0;
                    input.max = 900;

                    const span2 = document.createElement('span');
                    span2.textContent = '.lbs';
                    span2.classList.add('input-group-text');

                    inputGroup.appendChild(span1);
                    inputGroup.appendChild(input);
                    inputGroup.appendChild(span2);
                    formGroup.appendChild(inputGroup);
                    form.appendChild(inputTitle);
                    form.appendChild(formGroup);

                    if (exercise.percents) {
                        // Calculate percentage-based input value
                        const inputValue = Math.round(exercise.percents[rep] * selectedMax / 5) * 5;
                        input.value = inputValue;
                    } else {
                        // Fetch saved data asynchronously
                        (async () => {
                            const savedValue = await getWorkoutTitle(exerciseTitle, input.name);
                            input.placeholder = savedValue !== null ? savedValue : '';
                        })();
                    }

                    i++;
                }

                // Add a submit button
                const submitButton = document.createElement('button');
                submitButton.type = 'submit'; // Make it a submit button
                submitButton.textContent = ' Save';
                submitButton.classList.add('btn', 'mt-3', 'bi', 'bi-floppy-fill');

                // Form submission handler
                form.addEventListener('submit', (event) => {
                    event.preventDefault(); // Prevent default submission
                    if (form.checkValidity()) {
                        // Only proceed if the form is valid
                        addData(formId);
                    } else {
                        form.reportValidity(); // Show validation errors
                    }
                });

                form.appendChild(submitButton);

                // Append form to card body
                cardBody.appendChild(form);
                card.appendChild(cardBody);
                col.appendChild(card);

                // Append the card to the workoutContainer
                if (workoutContainer) {
                    workoutContainer.appendChild(col);
                }
            }

            // Create form for selected cycle
            if (savedDay == 'Monday') {
                createForm(workoutCycles, savedBenchMax, 'Bench');
            }
            else if (savedDay == 'Friday') {
                createForm(workoutCycles, savedSquatMax, 'Squat');
            }

            // Loop through each exercise in selectedWorkout
            for (const exerciseKey in selectedWorkout) {
                const exercise = selectedWorkout[exerciseKey];
                createForm(exercise, null, null);
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
    function getData() {
        const id = parseInt(document.getElementById("getId").value, 10);
        dbManager.get(id).then((data) => {
            console.log("Retrieved data:", JSON.stringify(data));
        });
    }

    function updateData() {
        const id = parseInt(document.getElementById("updateId").value, 10);
        const name = document.getElementById("updateName").value;
        const age = parseInt(document.getElementById("updateAge").value, 10);
        dbManager.update({ id, name, age }).then(() => {
            console.log(`Data with ID ${id} updated`);
        });
    }

    function getWorkoutTitle(title, set) {
        return dbManager.getAll().then((data) => {
            if (data.length === 0) {
                console.log("No data");
                return null; // Return null to indicate no match
            } else {
                const matchingItem = data.find(item => item.title === title);
                if (matchingItem) {
                    return matchingItem[set] || null; // Return the set value or null if it doesn't exist
                }
                return null; // Return null if no matching item is found
            }
        });
    }
    getAllData();
}

// Toast alert
function showToast(message, title = 'New Status') {
    // Create main header element
    const header = document.createElement('header');

    // Create toast container
    const toastDiv = document.createElement('div');
    toastDiv.classList.add('toast', 'show');

    // Create toast header
    const toastHeader = document.createElement('div');
    toastHeader.classList.add('toast-header');

    // Create title element
    const strongTitle = document.createElement('strong');
    strongTitle.textContent = title;

    // Create close button
    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.classList.add('btn-close');
    closeButton.setAttribute('data-bs-dismiss', 'toast', '');

    // Create toast body
    const toastBody = document.createElement('div');
    toastBody.classList.add('toast-body');

    // Create message paragraph
    const messagePara = document.createElement('p');
    messagePara.textContent = message;

    // Assemble the toast
    toastHeader.appendChild(strongTitle);
    toastHeader.appendChild(closeButton);
    toastBody.appendChild(messagePara);
    toastDiv.appendChild(toastHeader);
    toastDiv.appendChild(toastBody);
    header.appendChild(toastDiv);

    // Add to document
    document.body.appendChild(header);

    // Remove toast after 3 seconds
    setTimeout(() => {
        header.remove();
    }, 3000);

    // Handle close button click
    closeButton.addEventListener('click', () => {
        header.remove();
    });
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
                        logsDiv.classList.add('log-entry', 'card', 'mb-2');

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
//Register the service worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/PWA-Gym/service-worker.js', { scope: '/PWA-Gym/' })
        .then((registration) => {
            console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch((error) => {
            console.error('Service Worker registration failed:', error);
        });
}
