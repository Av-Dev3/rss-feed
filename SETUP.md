# Quick Setup Guide

## For Local Development

1. **Install dependencies:**
   ```bash
   cd client
   npm install
   ```

2. **Run development server:**
   ```bash
   npm run dev
   ```

3. **Open browser:**
   Navigate to `http://localhost:3000`

## For GitHub Pages Deployment

### Step 1: Create GitHub Repository

1. Create a new repository on GitHub
2. Note your repository name (e.g., `rss_feed_site`)

### Step 2: Update Configuration

1. Open `.github/workflows/deploy.yml`
2. Find this line:
   ```yaml
   VITE_BASE_PATH: /rss_feed_site/
   ```
3. Replace `rss_feed_site` with your actual repository name
4. If deploying to user/organization root (username.github.io), use `/` instead

### Step 3: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

### Step 4: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → **Pages**
3. Under **Source**, select **GitHub Actions**
4. Save

### Step 5: Wait for Deployment

1. Go to the **Actions** tab in your repository
2. Wait for the workflow to complete (usually 2-3 minutes)
3. Your site will be live at: `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/`

## Testing Your Deployment

After deployment, test by:
1. Adding a test RSS feed (e.g., `https://rss.cnn.com/rss/edition.rss`)
2. Verifying articles load correctly
3. Checking that feeds persist after page refresh

## Troubleshooting

- **404 errors**: Check that `VITE_BASE_PATH` matches your repo name exactly
- **Build fails**: Check the Actions tab for error messages
- **Feeds don't load**: Some feeds may have CORS restrictions; try different feeds

