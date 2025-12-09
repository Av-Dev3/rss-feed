import React, { useState, useEffect } from 'react';
import { createList, getLists, addArticleToList, isArticleInList, removeArticleFromList } from '../utils/lists';
import './SaveToListModal.css';

function SaveToListModal({ article, onClose, onSave }) {
  const [lists, setLists] = useState([]);
  const [newListName, setNewListName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadLists();
  }, []);

  const loadLists = () => {
    const allLists = getLists();
    setLists(allLists);
  };

  const handleCreateList = () => {
    if (!newListName.trim()) {
      setError('List name cannot be empty');
      return;
    }

    try {
      const newList = createList(newListName);
      setLists([...lists, newList]);
      setNewListName('');
      setShowCreateForm(false);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggleArticle = (listId) => {
    try {
      const isInList = isArticleInList(listId, article.id);
      
      if (isInList) {
        removeArticleFromList(listId, article.id);
      } else {
        addArticleToList(listId, article);
      }
      
      loadLists();
      if (onSave) onSave();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content save-list-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Save to List</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="article-preview">
            <h3>{article.title}</h3>
            <p className="article-feed-name">{article.feedName}</p>
          </div>

          {error && (
            <div className="error-message">{error}</div>
          )}

          {!showCreateForm ? (
            <button
              className="btn btn-primary create-list-btn"
              onClick={() => setShowCreateForm(true)}
            >
              + Create New List
            </button>
          ) : (
            <div className="create-list-form">
              <input
                type="text"
                className="list-name-input"
                placeholder="Enter list name..."
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateList()}
                autoFocus
              />
              <div className="form-actions">
                <button
                  className="btn btn-primary"
                  onClick={handleCreateList}
                >
                  Create
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewListName('');
                    setError(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="lists-section">
            <h3>Your Lists</h3>
            {lists.length === 0 ? (
              <p className="no-lists">No lists yet. Create one to get started!</p>
            ) : (
              <div className="lists-list">
                {lists.map(list => {
                  const isInList = isArticleInList(list.id, article.id);
                  return (
                    <div key={list.id} className="list-item">
                      <div className="list-info">
                        <span className="list-name">{list.name}</span>
                        <span className="list-count">{list.articles.length} articles</span>
                      </div>
                      <button
                        className={`btn ${isInList ? 'btn-remove' : 'btn-add'}`}
                        onClick={() => handleToggleArticle(list.id)}
                      >
                        {isInList ? '✓ Saved' : '+ Add'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SaveToListModal;

