// Script for form
const container = document.getElementById('workout-container');

window.onload = () => {
    // Load saved data on page load
    const savedTitle = localStorage.getItem('title');
    const savedSet1 = localStorage.getItem('set1');
    const savedSet2 = localStorage.getItem('set2');
    const savedSet3 = localStorage.getItem('set3');

    // fetch json file
    fetch('workouts.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Access the Monday workout
            const mondayWorkout = data.workouts.Monday;

            // Access the Monday workout
            const workoutCycles = data.cycles;

            // Loop through each exercise in Monday
            for (const exerciseKey in mondayWorkout) {
                const exercise = mondayWorkout[exerciseKey];
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

                // Add percents
                if (exercise.percents) {
                    const percents = document.createElement('p');
                    percents.classList.add('card-text');
                    percents.textContent = `Percents: ${exercise.percents.join(', ') || 'None'}`;
                    cardBody.appendChild(percents);
                }

                // Add form element
                const form = document.createElement('form');

                // Add input field name title
                const inputTitle = document.createElement('input');
                inputTitle.type = 'text';
                inputTitle.name = 'title';
                inputTitle.value = exercise.title;
                //inputTitle.hidden = true;

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
                        input.value = Math.round(exercise.percents[rep] * 100 / 5) * 5 || '';
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
                    saveData();
                });
                form.appendChild(submitButton);

                // Append form to card body
                cardBody.appendChild(form);
                card.appendChild(cardBody);
                col.appendChild(card);

                // Append the card to the container
                container.appendChild(col);
            };
})
        .catch (error => {
    console.error('Error fetching JSON:', error);
});
};

// Save data to IndexedDB
function saveData() {
    const title = document.getElementsByName('title').value;
    const set1 = document.getElementsByName('set1').value;
    const set2 = document.getElementsByName('set2').value;
    const set3 = document.getElementsByName('set3').value;

    const dbPromise = window.indexedDB.open('workoutDB', 1);

    dbPromise.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(['workouts'], 'readwrite');
        const store = transaction.objectStore('workouts');

        const workout = {
            title: title,
            set1: set1,
            set2: set2,
            set3: set3
        };

        store.add(workout);
    };

    dbPromise.onerror = (event) => {
        console.error('Error opening IndexedDB:', event.target.error);
    };
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
