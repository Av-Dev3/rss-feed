import React, { useState } from 'react';
import './AddFeedModal.css';

function AddFeedModal({ onClose, onAdd }) {
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!url.trim()) {
      setError('Please enter a feed URL');
      return;
    }

    setLoading(true);
    try {
      await onAdd(url.trim(), name.trim() || undefined);
      setUrl('');
      setName('');
    } catch (err) {
      setError(err.message || 'Failed to add feed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add RSS Feed</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          {error && (
            <div className="form-error">{error}</div>
          )}
          <div className="form-group">
            <label htmlFor="url">Feed URL *</label>
            <input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/feed.xml"
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="name">Feed Name (optional)</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Feed"
              disabled={loading}
            />
          </div>
          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Feed'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddFeedModal;

