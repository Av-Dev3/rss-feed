# RSS Feed Reader

A modern, beautiful RSS feed reader built with React. Read all your news in one place! Fully client-side and deployable to GitHub Pages.

## Features

- 📰 Add and manage multiple RSS feeds
- 🎨 Modern, dark-themed UI
- 📱 Responsive design for mobile and desktop
- ⚡ Fast article loading and parsing
- 🔄 Refresh feeds on demand
- 📖 Full article viewer with formatted content
- 🗑️ Easy feed management (add/remove)
- 💾 Local storage for feed persistence
- 🌐 Deployable to GitHub Pages

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Install dependencies:
```bash
npm run install:all
```

### Running Locally

Start the development server:

```bash
npm run dev
```

This will start the frontend client on `http://localhost:3000`

### Building for Production

```bash
npm run build
```

The built files will be in `client/dist/`

## Deploying to GitHub Pages

### Automatic Deployment (Recommended)

1. Push your code to a GitHub repository
2. Go to your repository Settings → Pages
3. Under "Source", select "GitHub Actions"
4. Update the `VITE_BASE_PATH` in `.github/workflows/deploy.yml` to match your repository name:
   ```yaml
   VITE_BASE_PATH: /your-repo-name/
   ```
5. Push to the `main` branch - GitHub Actions will automatically build and deploy

### Manual Deployment

1. Build the project:
   ```bash
   cd client
   VITE_BASE_PATH=/your-repo-name/ npm run build
   ```

2. Push the `dist` folder contents to the `gh-pages` branch:
   ```bash
   git subtree push --prefix client/dist origin gh-pages
   ```

3. Enable GitHub Pages in your repository settings (Settings → Pages → Source: gh-pages branch)

## Usage

1. **Add a Feed**: Click the "Add Feed" button and enter an RSS feed URL
2. **View Articles**: Click on a feed in the sidebar to view its articles, or view all articles together
3. **Read Articles**: Click on any article to read it in full
4. **Refresh**: Click the refresh button to fetch the latest articles
5. **Remove Feeds**: Click the × button on any feed to remove it

All feeds are stored locally in your browser's localStorage.

## Project Structure

```
rss-feed-reader/
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Actions deployment workflow
├── client/                 # Frontend React app
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── utils/          # Utilities (RSS parser, storage)
│   │   ├── App.jsx         # Main app component
│   │   └── main.jsx        # Entry point
│   └── package.json
└── package.json            # Root package.json
```

## Technologies Used

- **Frontend**: React, Vite
- **RSS Parsing**: Client-side XML parsing with CORS proxy
- **Storage**: Browser localStorage
- **Date Formatting**: date-fns
- **Deployment**: GitHub Pages + GitHub Actions

## How It Works

- **RSS Fetching**: Uses a CORS proxy service to fetch RSS feeds directly from the browser
- **Storage**: Feeds are stored in browser localStorage, so they persist across sessions
- **Parsing**: Client-side XML parsing extracts articles from RSS feeds
- **Static Hosting**: Fully static site that can be hosted anywhere

## License

MIT

