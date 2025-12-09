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

export async function fetchFeedArticles(feedUrl, feedName, feedId) {
  try {
    const proxyUrl = `${CORS_PROXY}${encodeURIComponent(feedUrl)}`;
    const response = await fetch(proxyUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const xmlText = await response.text();
    const articles = parseRSS(xmlText, feedName, feedId);
    
    return articles;
  } catch (error) {
    console.error('Error fetching feed:', error);
    throw new Error(`Failed to fetch feed: ${error.message}`);
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

