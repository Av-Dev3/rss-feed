import React from 'react';
import './FeedList.css';

function FeedList({ feeds, selectedFeed, onFeedSelect, onDeleteFeed }) {
  const handleDelete = (e, feedId) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this feed?')) {
      onDeleteFeed(feedId);
    }
  };

  return (
    <div className="feed-list">
      <div className="feed-list-header">
        <h2>Feeds ({feeds.length})</h2>
      </div>
      <div className="feed-list-content">
        {feeds.length === 0 ? (
          <div className="empty-state">
            <p>No feeds yet</p>
            <p className="empty-state-subtitle">Add a feed to get started</p>
          </div>
        ) : (
          feeds.map(feed => (
            <div
              key={feed.id}
              className={`feed-item ${selectedFeed === feed.id ? 'active' : ''}`}
              onClick={() => onFeedSelect(feed.id)}
            >
              <div className="feed-item-content">
                <span className="feed-name">{feed.name}</span>
                <span className="feed-url">{feed.url}</span>
              </div>
              <button
                className="feed-delete-btn"
                onClick={(e) => handleDelete(e, feed.id)}
                aria-label="Delete feed"
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default FeedList;

