// RSS Parser utility for client-side RSS fetching
// Uses CORS proxy to bypass browser CORS restrictions

const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

// Simple RSS parser (XML parsing) - supports both RSS and Atom feeds
function parseRSS(xmlText, feedName, feedId) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
  
  // Check for parsing errors
  const parseError = xmlDoc.querySelector('parsererror');
  if (parseError) {
    throw new Error('Failed to parse RSS feed');
  }

  const articles = [];
  
  // Try RSS format first
  let items = xmlDoc.querySelectorAll('item');
  
  // If no RSS items, try Atom format
  if (items.length === 0) {
    items = xmlDoc.querySelectorAll('entry');
  }

  items.forEach(item => {
    // RSS format
    let title = item.querySelector('title')?.textContent || 'Untitled';
    let link = item.querySelector('link')?.textContent || item.querySelector('link')?.getAttribute('href') || '#';
    let description = item.querySelector('description')?.textContent || 
                     item.querySelector('summary')?.textContent || 
                     item.querySelector('content')?.textContent || '';
    let pubDate = item.querySelector('pubDate')?.textContent || 
                 item.querySelector('published')?.textContent || 
                 item.querySelector('updated')?.textContent || 
                 new Date().toISOString();
    let guid = item.querySelector('guid')?.textContent || 
              item.querySelector('id')?.textContent || 
              link;
    let content = item.querySelector('content\\:encoded')?.textContent || 
                 item.querySelector('content')?.textContent || 
                 description;

    // Clean up HTML tags for snippet
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = description;
    const plainText = tempDiv.textContent || tempDiv.innerText || '';
    const snippet = plainText.substring(0, 200).trim();

    articles.push({
      id: guid || link || Math.random().toString(),
      title: title.trim(),
      link: link.trim(),
      content: content || description,
      snippet: snippet || 'No description available',
      pubDate,
      feedName,
      feedId
    });
  });

  if (articles.length === 0) {
    throw new Error('No articles found in feed');
  }

  return articles;
}

export async function fetchFeedArticles(feedUrl, feedName, feedId, retryCount = 0) {
  const MAX_RETRIES = 1; // Reduced retries to avoid spam
  const RETRY_DELAY = 5000; // 5 seconds
  
  try {
    const proxyUrl = `${CORS_PROXY}${encodeURIComponent(feedUrl)}`;
    
    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    const response = await fetch(proxyUrl, {
      signal: controller.signal,
      // Suppress CORS error logging by catching it before it bubbles
      mode: 'cors'
    }).catch(err => {
      // Silently handle CORS and network errors
      if (err.name === 'TypeError' || err.message?.includes('Failed to fetch') || err.message?.includes('CORS')) {
        return null; // Return null to indicate failure
      }
      throw err;
    });
    
    clearTimeout(timeoutId);
    
    // If fetch failed (CORS error, etc.)
    if (!response) {
      return [];
    }
    
    if (!response.ok) {
      // Handle rate limiting with retry (but only once)
      if (response.status === 429 && retryCount < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return fetchFeedArticles(feedUrl, feedName, feedId, retryCount + 1);
      }
      // Don't throw for common errors - just return empty
      if (response.status === 408 || response.status === 429 || response.status === 500 || response.status === 502) {
        return [];
      }
      // For other errors, return empty
      return [];
    }

    const xmlText = await response.text();
    const articles = parseRSS(xmlText, feedName, feedId);
    
    return articles;
  } catch (error) {
    // Silently handle all errors - don't retry, just return empty
    // This prevents console spam from CORS/rate limit errors
    return [];
  }
}

export async function validateFeedUrl(feedUrl) {
  try {
    await fetchFeedArticles(feedUrl, 'Test', 'test');
    return true;
  } catch {
    return false;
  }
}

