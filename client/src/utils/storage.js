// LocalStorage utility for feed persistence

const STORAGE_KEY = 'rss_feeds';

export function getFeeds() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading feeds from storage:', error);
    return [];
  }
}

export function saveFeeds(feeds) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(feeds));
  } catch (error) {
    console.error('Error saving feeds to storage:', error);
    throw new Error('Failed to save feeds');
  }
}

export function addFeed(url, name) {
  const feeds = getFeeds();
  
  // Check if feed already exists
  if (feeds.some(feed => feed.url === url)) {
    throw new Error('Feed already exists');
  }

  const newFeed = {
    id: Date.now().toString(),
    url,
    name: name || url,
    createdAt: new Date().toISOString()
  };

  feeds.push(newFeed);
  saveFeeds(feeds);
  return newFeed;
}

export function deleteFeed(id) {
  const feeds = getFeeds();
  const filteredFeeds = feeds.filter(feed => feed.id !== id);
  saveFeeds(filteredFeeds);
}

