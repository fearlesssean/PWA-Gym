import { showToast } from "./toast.js";

export function getAllData(dbManager, dataList) {
    // Check if we're on the account.html page
    dbManager.getAll().then((data) => {
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
                    });
                });
            })
            .catch((err) => {
                console.error('Error fetching workouts.json:', err);
                dataList.innerHTML = '<div class="card card-body"><p>Error loading workouts. Please try again.</p></div>';
            });
    });
    function deleteData(dataID) {
        dataID = parseInt(dataID, 10);
        dbManager.delete(dataID).then(() => {
            getAllData(dbManager, dataList);
            console.log(`Data with ID ${dataID} deleted`);
        });
    }
}
