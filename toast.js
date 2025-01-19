// toast.js
export function showToast(message, title = 'New Status') {
    const header = document.createElement('header');
    const toastDiv = document.createElement('div');
    toastDiv.classList.add('toast', 'show');

    const toastHeader = document.createElement('div');
    toastHeader.classList.add('toast-header');

    const strongTitle = document.createElement('strong');
    strongTitle.textContent = title;

    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.classList.add('btn-close');
    closeButton.setAttribute('data-bs-dismiss', 'toast', '');

    const toastBody = document.createElement('div');
    toastBody.classList.add('toast-body');

    const messagePara = document.createElement('p');
    messagePara.textContent = message;

    toastHeader.appendChild(strongTitle);
    toastHeader.appendChild(closeButton);
    toastBody.appendChild(messagePara);
    toastDiv.appendChild(toastHeader);
    toastDiv.appendChild(toastBody);
    header.appendChild(toastDiv);

    document.body.appendChild(header);

    setTimeout(() => {
        header.remove();
    }, 3000);

    closeButton.addEventListener('click', () => {
        header.remove();
    });
}
