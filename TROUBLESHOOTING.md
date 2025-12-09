# Troubleshooting: Styles Not Loading

If your site looks unstyled (like a README file), follow these steps:

## 1. Install Dependencies

Make sure all dependencies are installed:

```bash
cd client
npm install
```

## 2. Run Development Server

Start the development server to see if styles load locally:

```bash
cd client
npm run dev
```

Then open `http://localhost:3000` in your browser.

## 3. Build for Production

If deploying to GitHub Pages, build the project:

```bash
cd client
npm run build
```

This creates a `dist` folder with all assets including CSS.

## 4. Verify CSS Files

All CSS files should exist:
- `client/src/index.css` - Base styles
- `client/src/App.css` - App component styles
- `client/src/components/FeedList.css`
- `client/src/components/ArticleList.css`
- `client/src/components/ArticleViewer.css`
- `client/src/components/AddFeedModal.css`

## 5. Check Browser Console

Open browser DevTools (F12) and check:
- **Console tab**: Look for CSS loading errors
- **Network tab**: Verify CSS files are loading (status 200)
- **Elements tab**: Check if styles are applied to elements

## 6. GitHub Pages Deployment

If deploying to GitHub Pages:

1. Make sure `VITE_BASE_PATH` in `.github/workflows/deploy.yml` matches your repo name
2. Check the Actions tab for build errors
3. Verify the `dist` folder contains CSS files in the `assets` folder
4. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)

## 7. Common Issues

### CSS Not Loading
- Check that all CSS files are imported in their respective components
- Verify Vite is bundling CSS correctly
- Check browser console for 404 errors on CSS files

### Styles Not Applied
- Verify CSS variables are defined in `index.css`
- Check that class names match between JSX and CSS
- Ensure no CSS specificity conflicts

### Build Issues
- Delete `node_modules` and `dist` folders
- Run `npm install` again
- Try `npm run build` again

## Quick Fix

If nothing works, try:

```bash
cd client
rm -rf node_modules dist
npm install
npm run build
```

Then check the `dist` folder - it should contain:
- `index.html`
- `assets/` folder with CSS and JS files

