// Add Bootstrap styles dynamically
const bootstrapLink = document.createElement('link');
bootstrapLink.rel = 'stylesheet';
bootstrapLink.href = 'https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css';

class CycleForm extends HTMLElement {
    constructor() {
        super();
        // Create a shadow root for the element
        const shadowRoot = this.attachShadow({ mode: 'open' });

        // Clone and append shared Bootstrap link
        shadowRoot.appendChild(bootstrapLink.cloneNode());

        // Create the form container
        const container = document.createElement('div');
        container.classList.add('mt-4', 'p-5', 'bg-primary', 'text-white', 'rounded');

        // Create the title slot
        const title = document.createElement('h1');
        const titleSlot = document.createElement('slot');
        titleSlot.name = 'title';
        title.appendChild(titleSlot);

        // Create the form structure
        const form = document.createElement('form');
        form.innerHTML = `
            <input id="title" type="text" name="title" hidden>
            <slot name="sets-input"></slot>
            <button type="submit">Save</button>
        `;

        // Append the elements to the shadow root
        container.appendChild(title);
        container.appendChild(form);
        shadowRoot.appendChild(container);
    }
}

class SetsInput extends HTMLElement {
    constructor() {
        super();
        // Create a shadow root for the element
        const shadowRoot = this.attachShadow({ mode: 'open' });

        // Create a container for the inputs
        this.container = document.createElement('div');
        shadowRoot.appendChild(this.container);

        // Add Bootstrap CSS to the shadow root
        shadowRoot.appendChild(bootstrapLink.cloneNode());

        // Generate the input fields
        this.generateInputs();
    }

    // Watch for changes to the data-sets attribute
    static get observedAttributes() {
        return ['data-sets'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'data-sets' && oldValue !== newValue) {
            this.generateInputs();
        }
    }

    // Dynamically generate the input fields based on the number of sets
    generateInputs() {
        const sets = parseInt(this.getAttribute('data-sets')) || 1; // Default to 1 if no data-sets provided
        const shadowRoot = this.shadowRoot;

        // Clear the container before regenerating
        this.container.innerHTML = '';

        for (let i = 1; i <= sets; i++) {
            const group = document.createElement('div');
            group.className = 'input-group mb-3';

            const span = document.createElement('span');
            span.className = 'input-group-text';
            span.textContent = `Set ${i}:`;

            const input = document.createElement('input');
            input.type = 'number';
            input.className = 'form-control';
            input.name = `set${i}`;
            input.placeholder = `Reps for set ${i}`;
            input.required = true;

            group.appendChild(span);
            group.appendChild(input);
            this.container.appendChild(group);
        }
    }
}

// Define the custom elements
customElements.define('sets-input', SetsInput);
customElements.define('cycle-form', CycleForm);
