const workoutContainer = document.getElementById('workout-container');
const subtitle = document.getElementById('subtitle');

window.onload = () => {
    // Load saved data on page load
    const savedBenchMax = localStorage.getItem('benchMax') || 45;
    const savedSquatMax = localStorage.getItem('squatMax') || 45;
    const savedCycle = localStorage.getItem('cycle') || 'A1';
    const savedDay = localStorage.getItem('day') || 'Monday';
    // Initialize the database
    const dbManager = new IndexedDBManager("WorkoutDB", "logs");
    dbManager.init().then(() => console.log("Database initialized"));

    // Select workout cycle and day
    const savedayBtn = document.getElementById('day-btn');
    const cycleBtn = document.getElementById('cycle-btn');
    const logsBtn = document.getElementById('logs-btn');
    const saveBenchBtn = document.getElementById('saveBenchBtn');
    const saveSquatBtn = document.getElementById('saveSquatBtn');

    // Display saved data
    if (subtitle) {
        subtitle.innerHTML = `Cycle: ${savedCycle}, Day: ${savedDay}`;
    }

    if (logsBtn) {
        logsBtn.addEventListener('click', () => {
            getAllData();
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
    if (cycleBtn) {
        cycleBtn.addEventListener('click', () => {
            const selectCycle = document.getElementById('select-cycle') || 'A1';
            localStorage.setItem('cycle', selectCycle.value);
            showToast('Cycle was updated', 'New Status!');
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
            // Access the cycles workout
            const workoutCycles = data.cycles[savedCycle];
            // Access the day workout
            const selectedWorkout = data.workouts[savedDay];

            function createForm(exercise, selectedMax, addTitle) {
                // Create a col div for responsive layout
                const col = document.createElement('div');
                col.classList.add('col-md-6');

                // Create a card for each workout
                const card = document.createElement('div');
                card.classList.add('card', 'shadow-sm');

                const cardBody = document.createElement('div');
                cardBody.classList.add('card-body');

                // Create exercise title
                let exerciseTitle = exercise.title;
                if (addTitle != null) {
                    exerciseTitle = `${addTitle} ${exercise.title}`;
                }

                // Add workout title
                const cardTitle = document.createElement('h2');
                cardTitle.textContent = exerciseTitle;
                cardBody.appendChild(cardTitle);

                // Add form element
                const form = document.createElement('form');
                const formId = exerciseTitle.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase();
                form.id = formId;

                // Add input field name title
                const inputTitle = document.createElement('input');
                inputTitle.type = 'text';
                inputTitle.name = 'title';
                inputTitle.value = exerciseTitle;
                inputTitle.hidden = true;

                // Add input fields dynamically
                let i = 0;
                for (const rep in exercise.reps) {
                    //counter
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
                    if (exercise.percents) {
                        input.value = Math.round(exercise.percents[rep] * selectedMax / 5) * 5 || '';
                    }
                    input.classList.add('form-control');

                    const span2 = document.createElement('span');
                    span2.textContent = '.lbs';
                    span2.classList.add('input-group-text');

                    inputGroup.appendChild(span1);
                    inputGroup.appendChild(input);
                    inputGroup.appendChild(span2);
                    formGroup.appendChild(inputGroup);
                    form.appendChild(inputTitle);
                    form.appendChild(formGroup);
                    i++;
                };

                // Add a submit button
                const submitButton = document.createElement('button');
                //submitButton.type = 'submit';
                submitButton.textContent = ' Save';
                submitButton.classList.add('btn', 'mt-3', 'bi', 'bi-floppy-fill');
                submitButton.addEventListener('click', (event) => {
                    event.preventDefault();
                    addData(formId);
                });
                form.appendChild(submitButton);

                // Append form to card body
                cardBody.appendChild(form);
                card.appendChild(cardBody);
                col.appendChild(card);

                // Append the card to the workoutContainer
                workoutContainer.appendChild(col);
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
        strongTitle.classList.add('me-auto');
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

    // Button actions
    function getData() {
        const id = parseInt(document.getElementById("getId").value, 10);
        dbManager.get(id).then((data) => {
            console.log("Retrieved data:", data);
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

    function deleteData(dataID) {
        dataID = parseInt(dataID, 10);
        dbManager.delete(dataID).then(() => {
            console.log(`Data with ID ${dataID} deleted`);
        });
    }

    function getAllData() {
        dbManager.getAll().then((data) => {
            const dataList = document.getElementById('dataList');
            console.log("All data:", data);

            if (data.length == 0) {
                dataList.innerHTML = '<hr><p>No workout logs saved..</p>';
            }
            else {
                // Clear existing content
                dataList.innerHTML = '';
            }

            // Create and append user elements
            data.forEach(item => {
                // Create readable date and time
                const date = new Date(item.timestamp).toLocaleString(); // e.g., "1/13/2025, 12:34:56 PM"

                // Create a container for the log entry
                const logsDiv = document.createElement('div');
                logsDiv.classList.add('log-entry', 'card', 'mb-2');

                // Build the content dynamically
                const sets = [];
                for (let i = 1; i <= 6; i++) {
                    if (item[`set${i}`]) {
                        sets.push(`
                    <li class="list-group-item">
                        <span class="fw-bold">Set ${i}:</span> ${item[`set${i}`]}.lbs
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
