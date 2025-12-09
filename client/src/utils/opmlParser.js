// OPML Parser utility for importing RSS feeds

export function parseOPML(opmlText) {
  if (!opmlText || typeof opmlText !== 'string') {
    throw new Error('Invalid OPML content');
  }

  // Clean up the text - remove BOM if present and fix common XML issues
  let cleanText = opmlText.replace(/^\uFEFF/, '').trim();
  
  // Fix unescaped ampersands in text attributes (common issue)
  // Replace & with &amp; but only when not already part of an entity
  cleanText = cleanText.replace(/&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)/g, '&amp;');
  
  if (!cleanText.includes('<opml') && !cleanText.includes('<OPML')) {
    throw new Error('File does not appear to be a valid OPML file');
  }

  const parser = new DOMParser();
  let xmlDoc;
  
  try {
    xmlDoc = parser.parseFromString(cleanText, 'text/xml');
  } catch (e) {
    throw new Error('Failed to parse XML: ' + e.message);
  }
  
  // Check for parsing errors
  const parseError = xmlDoc.querySelector('parsererror');
  if (parseError) {
    const errorText = parseError.textContent || 'Unknown parsing error';
    console.error('OPML Parse Error:', errorText);
    throw new Error('Failed to parse OPML file: ' + errorText.substring(0, 100));
  }

  const feeds = [];
  
  // Try multiple selectors to find outlines
  let outlines = xmlDoc.querySelectorAll('outline[type="rss"]');
  if (outlines.length === 0) {
    outlines = xmlDoc.querySelectorAll('outline[xmlUrl]');
  }
  if (outlines.length === 0) {
    // Try without type attribute - some OPML files don't specify type
    outlines = xmlDoc.querySelectorAll('outline');
  }

  outlines.forEach(outline => {
    const url = outline.getAttribute('xmlUrl') || 
                outline.getAttribute('url') || 
                outline.getAttribute('htmlUrl');
    const name = outline.getAttribute('text') || 
                 outline.getAttribute('title') || 
                 outline.getAttribute('name') ||
                 url;

    // Only add if it has a URL and looks like an RSS feed
    if (url && (url.includes('http') || url.includes('feed') || url.includes('rss') || url.includes('xml') || url.includes('atom'))) {
      feeds.push({
        url: url.trim(),
        name: (name || url).trim()
      });
    }
  });

  if (feeds.length === 0) {
    throw new Error('No RSS feeds found in OPML file. Make sure the file contains outline elements with xmlUrl attributes.');
  }

  return feeds;
}

export async function importOPMLFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const feeds = parseOPML(e.target.result);
        resolve(feeds);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
}

