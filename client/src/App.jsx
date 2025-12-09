import React, { useState, useEffect, useMemo } from 'react';
import FeedList from './components/FeedList';
import ArticleList from './components/ArticleList';
import ArticleViewer from './components/ArticleViewer';
import AddFeedModal from './components/AddFeedModal';
import ImportOPMLModal from './components/ImportOPMLModal';
import SearchBar from './components/SearchBar';
import TopicFilter from './components/TopicFilter';
import SaveToListModal from './components/SaveToListModal';
import SavedLists from './components/SavedLists';
import { getFeeds, addFeed, deleteFeed, addFeedsBulk } from './utils/storage';
import { fetchFeedArticles } from './utils/rssParser';
import { getCachedArticles, setCachedArticles, clearCache } from './utils/cache';
import './App.css';

function App() {
  const [feeds, setFeeds] = useState([]);
  const [articles, setArticles] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [selectedFeed, setSelectedFeed] = useState(null);
  const [showAddFeed, setShowAddFeed] = useState(false);
  const [showImportOPML, setShowImportOPML] = useState(false);
  const [showSidebar, setShowSidebar] = useState(window.innerWidth >= 769);
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [articleToSave, setArticleToSave] = useState(null);
  const [showSavedLists, setShowSavedLists] = useState(false);

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

      const DELAY_BETWEEN_FEEDS = 1500; // 1.5 second delay between individual feeds
      
      // Separate feeds into cached and uncached
      const feedsToFetchList = [];
      const cachedFeeds = [];
      
      feedsToFetch.forEach(feed => {
        const cached = getCachedArticles(feed.id);
        if (cached && cached.length > 0) {
          cachedFeeds.push({ feed, articles: cached });
        } else {
          feedsToFetchList.push(feed);
        }
      });
      
      // Start with cached articles
      let currentArticles = [];
      cachedFeeds.forEach(({ articles }) => {
        currentArticles.push(...articles);
      });
      
      // Update UI with cached articles immediately
      if (cachedFeeds.length > 0) {
        const sortedArticles = [...currentArticles].sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
        setArticles(sortedArticles);
      }
      
      // Only fetch feeds that aren't cached or are stale
      if (feedsToFetchList.length > 0) {
        setLoadingProgress({ current: 0, total: feedsToFetchList.length });
        
        // Process feeds one at a time to show articles as they load
        for (let i = 0; i < feedsToFetchList.length; i++) {
          const feed = feedsToFetchList[i];
          
          try {
            const articles = await fetchFeedArticles(feed.url, feed.name, feed.id);
            
            // Cache the articles
            if (articles && articles.length > 0) {
              setCachedArticles(feed.id, articles);
              // Add articles immediately and update UI using functional update
              setArticles(prevArticles => {
                const combined = [...prevArticles, ...articles];
                return combined.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
              });
            }
            
            setLoadingProgress(prev => ({ ...prev, current: prev.current + 1 }));
          } catch (err) {
            // Silently fail individual feeds
            setLoadingProgress(prev => ({ ...prev, current: prev.current + 1 }));
          }
          
          // Small delay between feeds to avoid overwhelming the proxy
          if (i < feedsToFetchList.length - 1) {
            await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_FEEDS));
          }
        }
      } else {
        // All feeds were cached, no loading needed
        setLoading(false);
      }
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
      clearCache(id); // Clear cache when feed is deleted
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
    setSelectedTopic(null); // Clear topic when selecting a feed
  };

  const handleTopicChange = (topic) => {
    setSelectedTopic(topic);
    setSelectedFeed(null); // Clear feed selection when selecting a topic
    setSelectedArticle(null);
  };

  const handleArticleSelect = (article) => {
    setSelectedArticle(article);
  };

  const handleSaveArticle = (article) => {
    setArticleToSave(article);
    setShowSaveModal(true);
  };

  const handleSaveComplete = () => {
    // Refresh any saved lists view if open
    // This could trigger a re-render if needed
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

  // Filter articles based on search query and topic
  const filteredArticles = useMemo(() => {
    let filtered = [...articles];

    // Filter by topic (if selected)
    if (selectedTopic) {
      // Get feed IDs for the selected topic
      const topicKeywords = {
        'AI': ['ai', 'artificial intelligence', 'machine learning', 'deep learning', 'neural', 'llm', 'gpt', 'openai', 'anthropic'],
        'Data Science': ['data science', 'data', 'analytics', 'big data', 'databricks', 'pandas', 'numpy'],
        'Tech News': ['tech', 'technology', 'news', 'gadget', 'device', 'hardware', 'software'],
        'Research': ['research', 'arxiv', 'paper', 'academic', 'journal', 'university', 'mit', 'stanford', 'berkeley'],
        'Programming': ['programming', 'code', 'developer', 'software', 'python', 'javascript', 'react', 'vue'],
        'Business': ['business', 'venture', 'startup', 'company', 'enterprise', 'corporate'],
        'Science': ['science', 'physics', 'biology', 'chemistry', 'nature', 'scientific'],
        'Robotics': ['robot', 'robotics', 'automation', 'autonomous']
      };

      const keywords = topicKeywords[selectedTopic] || [];
      filtered = filtered.filter(article => {
        const feedName = article.feedName?.toLowerCase() || '';
        return keywords.some(keyword => feedName.includes(keyword));
      });
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(article => {
        const title = (article.title || '').toLowerCase();
        const snippet = (article.snippet || '').toLowerCase();
        const content = (article.content || '').toLowerCase();
        const feedName = (article.feedName || '').toLowerCase();
        
        return title.includes(query) || 
               snippet.includes(query) || 
               content.includes(query) ||
               feedName.includes(query);
      });
    }

    return filtered;
  }, [articles, searchQuery, selectedTopic]);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>📰 RSS Feed Reader</h1>
          <div className="header-actions">
            <button 
              className="btn btn-secondary" 
              onClick={() => setShowSidebar(!showSidebar)}
              title={showSidebar ? "Hide Feeds" : "Show Feeds"}
            >
              {showSidebar ? '📂' : '📁'} Feeds
            </button>
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
              onClick={() => {
                // Clear cache and refresh
                feeds.forEach(feed => clearCache(feed.id));
                handleRefresh();
              }}
              disabled={loading}
              title="Clear cache and refresh all feeds"
            >
              🔄 Refresh
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={() => setShowSavedLists(true)}
              title="View saved lists"
            >
              📚 Saved Lists
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
        <aside className={`sidebar ${showSidebar ? 'open' : ''}`}>
          <FeedList
            feeds={feeds}
            selectedFeed={selectedFeed}
            onFeedSelect={handleFeedSelect}
            onDeleteFeed={handleDeleteFeed}
          />
        </aside>

        {showSidebar && <div className="sidebar-overlay" onClick={() => setShowSidebar(false)}></div>}

        <main className="main-content">
          {showSavedLists ? (
            <SavedLists
              onArticleSelect={handleArticleSelect}
              onClose={() => setShowSavedLists(false)}
            />
          ) : selectedArticle ? (
            <ArticleViewer
              article={selectedArticle}
              onBack={() => setSelectedArticle(null)}
              onSaveArticle={handleSaveArticle}
            />
          ) : (
            <>
              <SearchBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                articleCount={articles.length}
                filteredCount={filteredArticles.length}
              />
              <TopicFilter
                feeds={feeds}
                selectedTopic={selectedTopic}
                onTopicChange={handleTopicChange}
              />
              <ArticleList
                articles={filteredArticles}
                loading={loading}
                loadingProgress={loadingProgress}
                onArticleSelect={handleArticleSelect}
                onSaveArticle={handleSaveArticle}
              />
            </>
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

      {showSaveModal && articleToSave && (
        <SaveToListModal
          article={articleToSave}
          onClose={() => {
            setShowSaveModal(false);
            setArticleToSave(null);
          }}
          onSave={handleSaveComplete}
        />
      )}
    </div>
  );
}

export default App;

