import React, { useState, useEffect } from 'react';
import FeedList from './components/FeedList';
import ArticleList from './components/ArticleList';
import ArticleViewer from './components/ArticleViewer';
import AddFeedModal from './components/AddFeedModal';
import ImportOPMLModal from './components/ImportOPMLModal';
import { getFeeds, addFeed, deleteFeed, addFeedsBulk } from './utils/storage';
import { fetchFeedArticles } from './utils/rssParser';
import './App.css';

function App() {
  const [feeds, setFeeds] = useState([]);
  const [articles, setArticles] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [selectedFeed, setSelectedFeed] = useState(null);
  const [showAddFeed, setShowAddFeed] = useState(false);
  const [showImportOPML, setShowImportOPML] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadFeeds();
  }, []);

  useEffect(() => {
    if (feeds.length > 0) {
      loadArticles();
    } else {
      setArticles([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feeds.length, selectedFeed]);

  const loadFeeds = () => {
    try {
      const storedFeeds = getFeeds();
      setFeeds(storedFeeds);
    } catch (err) {
      setError('Failed to load feeds');
      console.error(err);
    }
  };

  const loadArticles = async () => {
    setLoading(true);
    setError(null);
    try {
      const feedsToFetch = selectedFeed 
        ? feeds.filter(f => f.id === selectedFeed)
        : feeds;

      if (feedsToFetch.length === 0) {
        setArticles([]);
        setLoading(false);
        return;
      }

      const allArticles = [];
      
      // Fetch articles from all feeds in parallel
      const fetchPromises = feedsToFetch.map(async (feed) => {
        try {
          const articles = await fetchFeedArticles(feed.url, feed.name, feed.id);
          return articles;
        } catch (err) {
          console.error(`Error fetching feed ${feed.name}:`, err);
          return [];
        }
      });

      const results = await Promise.all(fetchPromises);
      results.forEach(articles => allArticles.push(...articles));

      // Sort by date (newest first)
      allArticles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
      
      setArticles(allArticles);
    } catch (err) {
      setError('Failed to load articles');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFeed = async (url, name) => {
    try {
      addFeed(url, name);
      loadFeeds();
      setShowAddFeed(false);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteFeed = (id) => {
    try {
      deleteFeed(id);
      loadFeeds();
      if (selectedFeed === id) {
        setSelectedFeed(null);
      }
    } catch (err) {
      setError('Failed to delete feed');
    }
  };

  const handleFeedSelect = (feedId) => {
    setSelectedFeed(feedId === selectedFeed ? null : feedId);
    setSelectedArticle(null);
  };

  const handleArticleSelect = (article) => {
    setSelectedArticle(article);
  };

  const handleRefresh = () => {
    loadArticles();
  };

  const handleImportOPML = async (feeds) => {
    try {
      const result = addFeedsBulk(feeds);
      loadFeeds();
      setShowImportOPML(false);
      setError(null);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>📰 RSS Feed Reader</h1>
          <div className="header-actions">
            <button 
              className="btn btn-primary" 
              onClick={() => setShowAddFeed(true)}
            >
              + Add Feed
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={() => setShowImportOPML(true)}
            >
              📥 Import OPML
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={handleRefresh}
              disabled={loading}
            >
              🔄 Refresh
            </button>
          </div>
        </div>
      </header>

      {error && (
        <div className="error-banner">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      <div className="app-content">
        <aside className="sidebar">
          <FeedList
            feeds={feeds}
            selectedFeed={selectedFeed}
            onFeedSelect={handleFeedSelect}
            onDeleteFeed={handleDeleteFeed}
          />
        </aside>

        <main className="main-content">
          {selectedArticle ? (
            <ArticleViewer
              article={selectedArticle}
              onBack={() => setSelectedArticle(null)}
            />
          ) : (
            <ArticleList
              articles={articles}
              loading={loading}
              onArticleSelect={handleArticleSelect}
            />
          )}
        </main>
      </div>

      {showAddFeed && (
        <AddFeedModal
          onClose={() => setShowAddFeed(false)}
          onAdd={handleAddFeed}
        />
      )}

      {showImportOPML && (
        <ImportOPMLModal
          onClose={() => setShowImportOPML(false)}
          onImport={handleImportOPML}
        />
      )}
    </div>
  );
}

export default App;

