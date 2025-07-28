# GitHub Pages Deployment Guide

This guide explains how to deploy this React app to GitHub Pages.

## Prerequisites

1. Make sure your repository is on GitHub
2. Ensure you have Node.js and npm installed locally

## Automatic Deployment (Recommended)

The project includes a GitHub Actions workflow that automatically deploys to GitHub Pages when you push to the `main` branch.

### Steps:

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Add GitHub Pages deployment"
   git push origin main
   ```

2. **Enable GitHub Pages:**
   - Go to your repository on GitHub
   - Navigate to Settings → Pages
   - Under "Source", select "Deploy from a branch"
   - Choose "gh-pages" branch
   - Click "Save"

3. **Wait for deployment:**
   - GitHub Actions will automatically build and deploy your app
   - You can monitor the progress in the "Actions" tab
   - Your app will be available at: `https://[your-username].github.io/wa-embedded-signup-flow/`

## Manual Deployment

If you prefer to deploy manually:

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build the project:**
   ```bash
   npm run build
   ```

3. **Deploy to GitHub Pages:**
   ```bash
   npm run deploy
   ```

## Configuration

- The base URL is configured in `vite.config.ts` to match your repository name (`wa-embedded-signup-flow`)
- The build output goes to the `dist` folder
- GitHub Pages serves from the `gh-pages` branch

## Troubleshooting

- If the deployment fails, check the GitHub Actions logs
- Ensure your repository name matches the base URL in `vite.config.ts` (`wa-embedded-signup-flow`)
- Make sure GitHub Pages is enabled in your repository settings 