import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Get base path from environment variable (for GitHub Pages)
// Set this to your repository name if deploying to GitHub Pages
// e.g., if repo is github.com/username/rss_feed_site, base should be '/rss_feed_site/'
const base = process.env.VITE_BASE_PATH || '/';

export default defineConfig({
  base,
  plugins: [react()],
  server: {
    port: 3000
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
});

