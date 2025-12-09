# GitHub Pages Setup - IMPORTANT!

If your site is showing a README file instead of the RSS reader app, follow these steps:

## Step 1: Verify GitHub Pages Configuration

1. Go to your repository on GitHub: `https://github.com/Av-Dev3/rss-feed`
2. Click **Settings** → **Pages** (left sidebar)
3. Under **Source**, make sure it says **"GitHub Actions"** (NOT "Deploy from a branch")
4. If it's set to a branch, change it to **"GitHub Actions"** and save

## Step 2: Check GitHub Actions

1. Go to the **Actions** tab in your repository
2. You should see a workflow called "Deploy to GitHub Pages"
3. Click on it to see if it's running or if there are any errors
4. If it failed, click on the failed run to see the error message

## Step 3: Trigger a New Deployment

If the workflow isn't running automatically:

1. Go to **Actions** tab
2. Click **"Deploy to GitHub Pages"** workflow
3. Click **"Run workflow"** button (top right)
4. Select **main** branch
5. Click **"Run workflow"**

## Step 4: Wait for Deployment

- The workflow takes 2-3 minutes to complete
- You'll see a yellow dot while it's running
- Green checkmark = success
- Red X = failure (check the logs)

## Step 5: Verify Your Site

Once deployment completes:
- Your site should be at: `https://av-dev3.github.io/rss-feed/`
- It should show the RSS reader app (dark theme, sidebar, etc.)
- NOT the README file

## Common Issues

### Still seeing README?
- Make sure GitHub Pages Source is set to **"GitHub Actions"** (not a branch)
- Clear your browser cache (Ctrl+Shift+R or Cmd+Shift+R)
- Wait a few minutes for DNS to propagate

### Build failing?
- Check the Actions tab for error messages
- Common issues: missing dependencies, Node version mismatch
- The workflow now uses `npm install` which should work

### 404 errors?
- Make sure the base path matches your repo name (`/rss-feed/`)
- The workflow auto-detects this now, so it should be correct

## Need Help?

Check the Actions tab logs - they'll tell you exactly what went wrong!

