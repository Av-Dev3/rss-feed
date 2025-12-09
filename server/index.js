import express from 'express';
import cors from 'cors';
import RSSParser from 'rss-parser';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const parser = new RSSParser();
const PORT = process.env.PORT || 3001;
const FEEDS_FILE = join(__dirname, 'feeds.json');

app.use(cors());
app.use(express.json());

// Initialize feeds file if it doesn't exist
async function initFeedsFile() {
  try {
    await fs.access(FEEDS_FILE);
  } catch {
    await fs.writeFile(FEEDS_FILE, JSON.stringify([], null, 2));
  }
}

// Get all feeds
app.get('/api/feeds', async (req, res) => {
  try {
    const data = await fs.readFile(FEEDS_FILE, 'utf-8');
    const feeds = JSON.parse(data);
    res.json(feeds);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read feeds' });
  }
});

// Add a new feed
app.post('/api/feeds', async (req, res) => {
  try {
    const { url, name } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const data = await fs.readFile(FEEDS_FILE, 'utf-8');
    const feeds = JSON.parse(data);
    
    // Check if feed already exists
    if (feeds.some(feed => feed.url === url)) {
      return res.status(400).json({ error: 'Feed already exists' });
    }

    const newFeed = {
      id: Date.now().toString(),
      url,
      name: name || url,
      createdAt: new Date().toISOString()
    };

    feeds.push(newFeed);
    await fs.writeFile(FEEDS_FILE, JSON.stringify(feeds, null, 2));
    res.json(newFeed);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add feed' });
  }
});

// Delete a feed
app.delete('/api/feeds/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = await fs.readFile(FEEDS_FILE, 'utf-8');
    const feeds = JSON.parse(data);
    const filteredFeeds = feeds.filter(feed => feed.id !== id);
    await fs.writeFile(FEEDS_FILE, JSON.stringify(filteredFeeds, null, 2));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete feed' });
  }
});

// Fetch articles from a feed
app.get('/api/feeds/:id/articles', async (req, res) => {
  try {
    const { id } = req.params;
    const data = await fs.readFile(FEEDS_FILE, 'utf-8');
    const feeds = JSON.parse(data);
    const feed = feeds.find(f => f.id === id);

    if (!feed) {
      return res.status(404).json({ error: 'Feed not found' });
    }

    const feedData = await parser.parseURL(feed.url);
    const articles = feedData.items.map(item => ({
      id: item.guid || item.link || Math.random().toString(),
      title: item.title || 'Untitled',
      link: item.link || '#',
      content: item.content || item.contentSnippet || '',
      snippet: item.contentSnippet || item.content?.substring(0, 200) || '',
      pubDate: item.pubDate || new Date().toISOString(),
      feedName: feed.name,
      feedId: feed.id
    }));

    res.json(articles);
  } catch (error) {
    console.error('Error fetching feed:', error);
    res.status(500).json({ error: 'Failed to fetch feed articles' });
  }
});

// Fetch all articles from all feeds
app.get('/api/articles', async (req, res) => {
  try {
    const data = await fs.readFile(FEEDS_FILE, 'utf-8');
    const feeds = JSON.parse(data);
    
    const allArticles = [];
    
    for (const feed of feeds) {
      try {
        const feedData = await parser.parseURL(feed.url);
        const articles = feedData.items.map(item => ({
          id: item.guid || item.link || Math.random().toString(),
          title: item.title || 'Untitled',
          link: item.link || '#',
          content: item.content || item.contentSnippet || '',
          snippet: item.contentSnippet || item.content?.substring(0, 200) || '',
          pubDate: item.pubDate || new Date().toISOString(),
          feedName: feed.name,
          feedId: feed.id
        }));
        allArticles.push(...articles);
      } catch (error) {
        console.error(`Error fetching feed ${feed.name}:`, error);
      }
    }

    // Sort by date (newest first)
    allArticles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
    
    res.json(allArticles);
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(join(__dirname, '../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(join(__dirname, '../client/dist/index.html'));
  });
}

async function start() {
  await initFeedsFile();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start();

