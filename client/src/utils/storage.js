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

export function addFeedsBulk(feedList) {
  const feeds = getFeeds();
  const existingUrls = new Set(feeds.map(f => f.url));
  const newFeeds = [];
  const skipped = [];
  let baseTime = Date.now();

  feedList.forEach(({ url, name }, index) => {
    const trimmedUrl = url.trim();
    if (!trimmedUrl) return; // Skip empty URLs
    
    if (!existingUrls.has(trimmedUrl)) {
      newFeeds.push({
        id: (baseTime + index).toString() + '-' + Math.random().toString(36).substr(2, 9),
        url: trimmedUrl,
        name: (name || trimmedUrl).trim(),
        createdAt: new Date().toISOString()
      });
      existingUrls.add(trimmedUrl);
    } else {
      skipped.push(trimmedUrl);
    }
  });

  if (newFeeds.length > 0) {
    feeds.push(...newFeeds);
    saveFeeds(feeds);
  }

  return {
    added: newFeeds.length,
    skipped: skipped.length,
    total: feedList.length
  };
}

