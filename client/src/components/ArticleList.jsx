import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import './ArticleList.css';

function ArticleList({ articles, loading, loadingProgress, onArticleSelect }) {
  if (loading) {
    return (
      <div className="article-list-loading">
        <div className="spinner"></div>
        <p>Loading articles...</p>
        {loadingProgress && loadingProgress.total > 0 && (
          <p className="loading-progress">
            {loadingProgress.current} / {loadingProgress.total} feeds loaded
          </p>
        )}
        <p className="loading-hint">This may take a few minutes for many feeds...</p>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="article-list-empty">
        <p>No articles found</p>
        <p className="empty-subtitle">Add some feeds to see articles here</p>
      </div>
    );
  }

  return (
    <div className="article-list">
      <div className="article-list-header">
        <h2>Articles ({articles.length})</h2>
      </div>
      <div className="article-list-content">
        {articles.map(article => (
          <article
            key={article.id}
            className="article-card"
            onClick={() => onArticleSelect(article)}
          >
            <div className="article-header">
              <h3 className="article-title">{article.title}</h3>
              <span className="article-feed">{article.feedName}</span>
            </div>
            {article.snippet && (
              <p className="article-snippet">{article.snippet}</p>
            )}
            <div className="article-footer">
              <time className="article-date">
                {formatDistanceToNow(new Date(article.pubDate), { addSuffix: true })}
              </time>
              <a
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                className="article-link"
                onClick={(e) => e.stopPropagation()}
              >
                Open →
              </a>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export default ArticleList;

