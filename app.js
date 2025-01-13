
// Script for form
const workoutContainer = document.getElementById('workout-container');

window.onload = () => {
    // Load saved data on page load

    // Initialize the database
    const dbManager = new IndexedDBManager("WorkoutDB", "logs");
    dbManager.init().then(() => console.log("Database initialized"));

    // Select workout cycle and day
    const dayBtn = document.getElementById('day-btn');
    const logsBtn = document.getElementById('logs-btn');
    const selectCycle = document.getElementById('select-cycle') || 'A1';
    const selectDay = document.getElementById('select-day') || 'Monday';
    const maxInput = document.getElementById('input-max') || 45;

    if (logsBtn) {
        logsBtn.addEventListener('click', () => {
            getAllData();
        });
    }

    if (dayBtn) {
        // Event listener for day and cycle selection
        dayBtn.addEventListener('click', () => {
            // Clear the workout workoutContainer
            workoutContainer.innerHTML = "";
            const selectedCycle = selectCycle.value; // Get the selected day from the dropdown
            const selectedDay = selectDay.value; // Get the selected day from the dropdown
            const selectedMax = maxInput.value;
            // fetch json file
            fetch('workouts.json')
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    // Access the cycles workout
                    const workoutCycles = data.cycles[selectedCycle];
                    // Access the day workout
                    const selectedWorkout = data.workouts[selectedDay];

                    function createForm(exercise, selectedMax) {
                        // Create a col div for responsive layout
                        const col = document.createElement('div');
                        col.classList.add('col-md-6');

                        // Create a card for each workout
                        const card = document.createElement('div');
                        card.classList.add('card', 'shadow-sm', 'bg-dark', 'text-light');

                        const cardBody = document.createElement('div');
                        cardBody.classList.add('card-body');

                        // Add workout title
                        const cardTitle = document.createElement('h5');
                        cardTitle.classList.add('card-title');
                        cardTitle.textContent = exercise.title;
                        cardBody.appendChild(cardTitle);

                        // Add form element
                        const form = document.createElement('form');
                        const formId = exercise.title.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase();
                        form.id = formId;

                        // Add input field name title
                        const inputTitle = document.createElement('input');
                        inputTitle.type = 'text';
                        inputTitle.name = 'title';
                        inputTitle.value = exercise.title;
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
                        submitButton.textContent = 'Save Workout';
                        submitButton.classList.add('btn', 'btn-warning', 'mt-3');
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
                    if (selectedDay == 'Monday' || selectedDay == 'Friday') {
                        createForm(workoutCycles, selectedMax);
                    }

                    // Loop through each exercise in selectedWorkout
                    for (const exerciseKey in selectedWorkout) {
                        const exercise = selectedWorkout[exerciseKey];
                        createForm(exercise, selectedMax);
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

                dbManager.add(data).then((id) => {
                    console.log(`Data added with ID: ${id}`);
                });
            }
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
            console.log("All data:", data);
            const dataList = document.getElementById("dataList");

            if (data.length == 0) {
                dataList.innerHTML = '<hr><p>No workout logs saved..</p>';
            }
            else {
                dataList.innerHTML = '';
            }
            // Clear existing content

            // Create and append user elements
            data.forEach(item => {
                const logsDiv = document.createElement('div');
                logsDiv.innerHTML = `
                    <hr>
                    <h3>${item.title}</h3>
                    <p>Set 1: ${item.set1}</p>
                    <p>ID: ${item.id}</p>
                    <button class="delete-btn btn btn-danger" data-id="${item.id}">Delete</button>
                `;
                dataList.appendChild(logsDiv);

                // Add event listener for delete
                const deleteButton = logsDiv.querySelector('.delete-btn');
                deleteButton.addEventListener('click', () => {
                    const idToDelete = deleteButton.getAttribute('data-id');
                    deleteData(idToDelete); // Call your delete function with the ID
                    getAllData();
                });
            });
        });
    }
};
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
