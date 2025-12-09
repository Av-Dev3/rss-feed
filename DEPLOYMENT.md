# GitHub Pages Deployment Guide

## Quick Start

1. **Create a GitHub Repository**
   - Create a new repository on GitHub (e.g., `rss_feed_site`)
   - Push your code to the repository

2. **Update Base Path**
   - Edit `.github/workflows/deploy.yml`
   - Change `VITE_BASE_PATH: /rss_feed_site/` to match your repository name
   - If your repo is `github.com/username/my-rss-reader`, use `/my-rss-reader/`
   - If deploying to a custom domain or user/organization root, use `/`

3. **Enable GitHub Pages**
   - Go to your repository Settings → Pages
   - Under "Source", select "GitHub Actions"
   - Save the settings

4. **Deploy**
   - Push your code to the `main` branch
   - GitHub Actions will automatically build and deploy
   - Check the Actions tab to see the deployment progress
   - Your site will be available at `https://username.github.io/repo-name/`

## Important Notes

- **Repository Name**: Make sure the `VITE_BASE_PATH` matches your repository name exactly
- **Custom Domain**: If using a custom domain, set `VITE_BASE_PATH: /` in the workflow file
- **First Deployment**: The first deployment may take a few minutes
- **Updates**: Every push to `main` will trigger a new deployment

## Troubleshooting

### 404 Errors
- Check that `VITE_BASE_PATH` matches your repository name
- Ensure GitHub Pages is enabled in repository settings
- Check the Actions tab for build errors

### CORS Issues
- The app uses a CORS proxy (`api.allorigins.win`) to fetch RSS feeds
- Some feeds may still fail due to CORS restrictions
- If a feed doesn't load, try a different RSS feed URL

### Build Failures
- Check the Actions tab for error messages
- Ensure all dependencies are listed in `client/package.json`
- Verify Node.js version compatibility (18+)

## Manual Deployment (Alternative)

If you prefer manual deployment:

```bash
# Build with correct base path
cd client
VITE_BASE_PATH=/your-repo-name/ npm run build

# Deploy using gh-pages package (install first: npm install -g gh-pages)
cd dist
git init
git add .
git commit -m "Deploy"
git branch -M gh-pages
git remote add origin https://github.com/username/repo-name.git
git push -u origin gh-pages
```

Then enable GitHub Pages to use the `gh-pages` branch.

