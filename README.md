# Simple PWA on GitHub Pages

This is a simple Progressive Web App (PWA) that demonstrates how to use GitHub Pages to host a static website with offline functionality. The app is built with HTML, CSS, and JavaScript, and it includes a manifest file and a service worker to make it installable and work offline.

## Features
- Progressive Web App (PWA) with offline functionality.
- Service worker caching for offline use.
- Customizable icons for app installation.
- Hosted on GitHub Pages (free hosting solution).

### Files Description:
- **`index.html`**: The main entry point for the PWA. Contains the structure of the app.
- **`manifest.json`**: Provides metadata about the app, including its name, icons, and how it should appear when installed.
- **`service-worker.js`**: Enables offline functionality by caching assets.
- **`icons/`**: Contains app icons in different sizes for use in installation prompts.

## How to Set Up Your Own PWA

1. **Clone the repository** to your local machine:
   ```bash
   git clone https://github.com/your-username/my-pwa-app.git
   cd my-pwa-app
   ```

2. **Make changes** to index.html, manifest.json, and service-worker.js as needed. You can add more pages, change the styling, or update the caching logic.

3. **Push your changes to GitHub:**
    ```bash
    Copy code
    git add .
    git commit -m "Made updates"
    git push origin main
    ```
    
4. **Enable GitHub Pages:**
- Go to the Settings of your GitHub repository.
- Scroll down to the GitHub Pages section.
- Under Source, select master branch (or main branch if applicable) and save.
- Your site will be available at https://your-username.github.io/my-pwa-app/.

## GitHub Pages Limits

**GitHub Pages provides free hosting, but there are some limitations:**

- Bandwidth Limit: 100 GB per month.
- File Size Limit: 100 MB per file.
- Repository Size: Recommended size limit of 1 GB.
- Public Repositories: Free accounts require public repositories. Private repositories are available with paid plans.
- For larger or more dynamic projects, consider using other hosting platforms like Netlify, Vercel, or AWS.