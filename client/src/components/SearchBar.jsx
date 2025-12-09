import React from 'react';
import './SearchBar.css';

function SearchBar({ searchQuery, onSearchChange, articleCount, filteredCount }) {
  return (
    <div className="search-bar">
      <div className="search-input-wrapper">
        <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
        <input
          type="text"
          className="search-input"
          placeholder="Search articles by keyword..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {searchQuery && (
          <button
            className="search-clear"
            onClick={() => onSearchChange('')}
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>
      {searchQuery && (
        <div className="search-results-info">
          Showing {filteredCount} of {articleCount} articles
        </div>
      )}
    </div>
  );
}

export default SearchBar;

