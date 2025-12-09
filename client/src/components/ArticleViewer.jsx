import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import './ArticleViewer.css';

function ArticleViewer({ article, onBack }) {
  return (
    <div className="article-viewer">
      <div className="article-viewer-header">
        <button className="back-btn" onClick={onBack}>
          ← Back
        </button>
        <a
          href={article.link}
          target="_blank"
          rel="noopener noreferrer"
          className="external-link"
        >
          Open Original →
        </a>
      </div>
      <article className="article-content">
        <div className="article-meta">
          <span className="article-feed-badge">{article.feedName}</span>
          <time className="article-date">
            {formatDistanceToNow(new Date(article.pubDate), { addSuffix: true })}
          </time>
        </div>
        <h1 className="article-viewer-title">{article.title}</h1>
        <div
          className="article-body"
          dangerouslySetInnerHTML={{ __html: article.content || article.snippet }}
        />
      </article>
    </div>
  );
}

export default ArticleViewer;

