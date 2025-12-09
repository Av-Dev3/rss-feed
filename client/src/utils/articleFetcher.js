// Utility to fetch full article content from URLs

const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

export async function fetchArticleContent(articleUrl) {
  try {
    const proxyUrl = `${CORS_PROXY}${encodeURIComponent(articleUrl)}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(proxyUrl, {
      signal: controller.signal,
      mode: 'cors'
    }).catch(() => null);
    
    clearTimeout(timeoutId);
    
    if (!response || !response.ok) {
      return null;
    }

    const html = await response.text();
    return extractArticleContent(html);
  } catch (error) {
    return null;
  }
}

function extractArticleContent(html) {
  // Try to extract main article content from HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  // Common article selectors
  const selectors = [
    'article',
    '[role="article"]',
    '.article-content',
    '.post-content',
    '.entry-content',
    '.content',
    'main',
    '.main-content'
  ];
  
  for (const selector of selectors) {
    const element = doc.querySelector(selector);
    if (element) {
      // Remove unwanted elements
      const unwanted = element.querySelectorAll('script, style, nav, header, footer, aside, .ad, .advertisement, .social-share');
      unwanted.forEach(el => el.remove());
      
      return element.innerHTML;
    }
  }
  
  // Fallback: return body content
  const body = doc.body;
  if (body) {
    const unwanted = body.querySelectorAll('script, style, nav, header, footer, aside, .ad, .advertisement');
    unwanted.forEach(el => el.remove());
    return body.innerHTML;
  }
  
  return null;
}

