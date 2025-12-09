import React, { useState, useEffect } from 'react';
import { getLists, deleteList } from '../utils/lists';
import ArticleList from './ArticleList';
import './SavedLists.css';

function SavedLists({ onArticleSelect, onClose }) {
  const [lists, setLists] = useState([]);
  const [selectedList, setSelectedList] = useState(null);

  useEffect(() => {
    loadLists();
  }, []);

  const loadLists = () => {
    const allLists = getLists();
    setLists(allLists);
  };

  const handleDeleteList = (listId) => {
    if (window.confirm('Are you sure you want to delete this list? This cannot be undone.')) {
      deleteList(listId);
      loadLists();
      if (selectedList?.id === listId) {
        setSelectedList(null);
      }
    }
  };

  const selectedListData = lists.find(l => l.id === selectedList?.id);

  return (
    <div className="saved-lists">
      <div className="saved-lists-header">
        <h2>📚 Saved Lists</h2>
        {onClose && (
          <button className="close-btn" onClick={onClose}>×</button>
        )}
      </div>

      <div className="saved-lists-content">
        <aside className="lists-sidebar">
          <div className="lists-list">
            {lists.length === 0 ? (
              <div className="no-lists-message">
                <p>No saved lists yet.</p>
                <p className="hint">Save articles to create lists!</p>
              </div>
            ) : (
              lists.map(list => (
                <div
                  key={list.id}
                  className={`list-item ${selectedList?.id === list.id ? 'active' : ''}`}
                  onClick={() => setSelectedList(list)}
                >
                  <div className="list-item-content">
                    <span className="list-item-name">{list.name}</span>
                    <span className="list-item-count">{list.articles.length} articles</span>
                  </div>
                  <button
                    className="list-delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteList(list.id);
                    }}
                    title="Delete list"
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </aside>

        <main className="lists-main">
          {selectedListData ? (
            <>
              <div className="list-header">
                <h3>{selectedListData.name}</h3>
                <span className="list-article-count">{selectedListData.articles.length} articles</span>
              </div>
              {selectedListData.articles.length > 0 ? (
                <ArticleList
                  articles={selectedListData.articles}
                  loading={false}
                  loadingProgress={null}
                  onArticleSelect={onArticleSelect}
                />
              ) : (
                <div className="empty-list">
                  <p>This list is empty.</p>
                  <p className="hint">Save articles to this list to see them here.</p>
                </div>
              )}
            </>
          ) : (
            <div className="no-list-selected">
              <p>Select a list to view its articles</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default SavedLists;

