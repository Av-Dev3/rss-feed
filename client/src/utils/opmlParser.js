// OPML Parser utility for importing RSS feeds

export function parseOPML(opmlText) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(opmlText, 'text/xml');
  
  // Check for parsing errors
  const parseError = xmlDoc.querySelector('parsererror');
  if (parseError) {
    throw new Error('Failed to parse OPML file');
  }

  const feeds = [];
  const outlines = xmlDoc.querySelectorAll('outline[type="rss"], outline[xmlUrl]');

  outlines.forEach(outline => {
    const url = outline.getAttribute('xmlUrl') || outline.getAttribute('url');
    const name = outline.getAttribute('text') || outline.getAttribute('title') || url;

    if (url) {
      feeds.push({
        url: url.trim(),
        name: name.trim()
      });
    }
  });

  if (feeds.length === 0) {
    throw new Error('No RSS feeds found in OPML file');
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

