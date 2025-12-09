// Cache utility for storing RSS feed articles
// Articles are cached with timestamps and only refreshed if stale

const CACHE_KEY_PREFIX = 'rss_cache_';
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

export function getCachedArticles(feedId) {
  try {
    const cacheKey = `${CACHE_KEY_PREFIX}${feedId}`;
    const cached = localStorage.getItem(cacheKey);
    
    if (!cached) {
      return null;
    }

    const { articles, timestamp } = JSON.parse(cached);
    const age = Date.now() - timestamp;

    // Return cached articles if they're still fresh
    if (age < CACHE_DURATION) {
      return articles;
    }

    // Cache is stale, remove it
    localStorage.removeItem(cacheKey);
    return null;
  } catch (error) {
    console.error('Error reading cache:', error);
    return null;
  }
}

export function setCachedArticles(feedId, articles) {
  try {
    const cacheKey = `${CACHE_KEY_PREFIX}${feedId}`;
    const cacheData = {
      articles,
      timestamp: Date.now()
    };
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Error writing cache:', error);
    // If storage is full, try to clear old cache entries
    clearOldCache();
  }
}

export function clearCache(feedId) {
  try {
    const cacheKey = `${CACHE_KEY_PREFIX}${feedId}`;
    localStorage.removeItem(cacheKey);
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
}

export function clearAllCache() {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(CACHE_KEY_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Error clearing all cache:', error);
  }
}

function clearOldCache() {
  try {
    const keys = Object.keys(localStorage);
    const now = Date.now();
    
    keys.forEach(key => {
      if (key.startsWith(CACHE_KEY_PREFIX)) {
        try {
          const cached = localStorage.getItem(key);
          if (cached) {
            const { timestamp } = JSON.parse(cached);
            // Remove cache older than 1 hour
            if (now - timestamp > 60 * 60 * 1000) {
              localStorage.removeItem(key);
            }
          }
        } catch (e) {
          // Remove invalid cache entries
          localStorage.removeItem(key);
        }
      }
    });
  } catch (error) {
    console.error('Error clearing old cache:', error);
  }
}

export function getCacheAge(feedId) {
  try {
    const cacheKey = `${CACHE_KEY_PREFIX}${feedId}`;
    const cached = localStorage.getItem(cacheKey);
    
    if (!cached) {
      return null;
    }

    const { timestamp } = JSON.parse(cached);
    return Date.now() - timestamp;
  } catch (error) {
    return null;
  }
}

