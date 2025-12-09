import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { fetchArticleContent } from '../utils/articleFetcher';
import './ArticleViewer.css';

function ArticleViewer({ article, onBack }) {
  const [fullContent, setFullContent] = useState(null);
  const [loadingContent, setLoadingContent] = useState(false);
  const [useFullContent, setUseFullContent] = useState(false);

  useEffect(() => {
    // Check if RSS content is already full (has substantial content)
    const rssContent = article.content || article.snippet || '';
    const isFullContent = rssContent.length > 500; // If RSS content is > 500 chars, it's likely full
    
    if (!isFullContent && article.link) {
      // Try to fetch full content
      setLoadingContent(true);
      fetchArticleContent(article.link)
        .then(content => {
          if (content && content.length > rssContent.length) {
            setFullContent(content);
            setUseFullContent(true);
          }
          setLoadingContent(false);
        })
        .catch(() => {
          setLoadingContent(false);
        });
    } else {
      setUseFullContent(true); // Use RSS content if it's already full
    }
  }, [article]);

  const displayContent = useFullContent 
    ? (fullContent || article.content || article.snippet || 'No content available')
    : (article.content || article.snippet || 'No content available');

  return (
    <div className="article-viewer">
      <div className="article-viewer-header">
        <button className="back-btn" onClick={onBack}>
          ← Back
        </button>
        <div className="header-actions-right">
          {loadingContent && (
            <span className="loading-text">Loading full article...</span>
          )}
          <a
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            className="external-link"
          >
            Open Original →
          </a>
        </div>
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
          dangerouslySetInnerHTML={{ 
            __html: displayContent.replace(
              /<img([^>]*)>/gi,
              '<img$1 onerror="this.style.display=\'none\'">'
            )
          }}
        />
      </article>
    </div>
  );
}

export default ArticleViewer;

