// Script for form
const form = document.getElementById('dataForm');
const output = document.getElementById('output');

window.onload = () => {
    // Load saved data on page load
    const savedTitle = localStorage.getItem('title');
    const savedSet1 = localStorage.getItem('set1');
    const savedSet2 = localStorage.getItem('set2');
    const savedSet3 = localStorage.getItem('set3');

    if (savedTitle || savedSet1 || savedSet2 || savedSet3) {
        output.innerHTML = `<p>Saved Data:</p>
            <p>Title: ${savedTitle || 'N/A'}</p>
            <p>Set1: ${savedSet1 || 'N/A'}</p>
            <p>Set2: ${savedSet2 || 'N/A'}</p>
            <p>Set3: ${savedSet3 || 'N/A'}</p>`;
    }

    // fetch json file
    fetch('workouts.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Iterate through the JSON keys
            let html_form = '';
            for (const key in data) {
                if (data[key]?.title) { // Safely access 'title'
                    let html = `
                    <h1>${data[key].title}</h1>
                    <form id="dataForm">
                        <input id="title" type="text" name="title" value="${data[key].title}" hidden>`
                    for (const set in data[key].reps) {
                        html += `<div class="input-group mb-3">
                                <span class="input-group-text">${data[key].reps[set]}x</span>
                                <input id="set1" type="number" class="form-control" name="set1" placeholder="" required>
                            </div>`
                    }; +
                        `<button type="submit">Save</button>
                    </form>
                    <hr>
                    `;
                    html_form += html;
                } else {
                    console.error(`Missing 'title' for key: ${key}`);
                }
            }
            document.getElementById("workout-form").innerHTML = html_form;
        })
        .catch(error => {
            console.error('Error fetching JSON:', error);
        });
};

// Save data to localStorage on form submit
form.addEventListener('submit', (event) => {
    event.preventDefault(); // Prevent page reload

    const title = document.getElementById('title').value;
    const set1 = document.getElementById('set1').value;
    const set2 = document.getElementById('set2').value;
    const set3 = document.getElementById('set3').value;

    localStorage.setItem('title', title);
    localStorage.setItem('set1', set1);
    localStorage.setItem('set2', set2);
    localStorage.setItem('set3', set3);

    output.innerHTML = `
            <p>Data Saved Locally:</p>
            <p>Title: ${title}</p>
            <p>Set1: ${set1}</p>
            <p>Set2: ${set2}</p>
            <p>Set3: ${set3}</p>
        `;
});

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