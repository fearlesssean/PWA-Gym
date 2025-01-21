import { showToast } from "./toast.js";
import { WorkoutXPManager } from './ranking.js';

const xpManager = new WorkoutXPManager();


// form.js
export function createForm(exercise, selectedMax, addTitle, workoutContainer, dbManager) {
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
            const inputValue = Math.round(exercise.percents[rep] * selectedMax / 5) * 5;
            input.value = inputValue;
        } else {
            (async () => {
                const savedValue = await getWorkoutTitle(exerciseTitle, input.name, dbManager);
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

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        if (form.checkValidity()) {
            // Create a valid workout object
            const workout = {
                [exercise.title]: {
                    sets: exercise.reps.length,
                    reps: exercise.reps,
                }
            };
            addData(formId, dbManager);
        } else {
            form.reportValidity();
        }
    });


    form.appendChild(submitButton);
    cardBody.appendChild(form);
    card.appendChild(cardBody);
    col.appendChild(card);

    workoutContainer.appendChild(col);
}

async function getWorkoutTitle(title, set, dbManager) {
    const data = await dbManager.getAll();
    if (data.length === 0) {
        return null;
    }
    const matchingItem = data.find(item => item.title === title);
    return matchingItem ? matchingItem[set] || null : null;
}

function addData(formId, dbManager) {
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

    data.timestamp = new Date().toISOString();

    dbManager.add(data).then((id) => {
        // Calculate and add XP
        xpManager.saveWorkout();
        showToast(`Workout saved! ${new Date(data.timestamp).toLocaleString()}`, `New Status!`);
        console.log(`Data added with ID: ${id} and timestamp: ${data.timestamp}`);
    });
}
