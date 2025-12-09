import React, { useState, useRef } from 'react';
import { importOPMLFile } from '../utils/opmlParser';
import './ImportOPMLModal.css';

function ImportOPMLModal({ onClose, onImport }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showTextarea, setShowTextarea] = useState(false);
  const [opmlText, setOpmlText] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const feeds = await importOPMLFile(file);
      console.log('Parsed feeds:', feeds.length);
      const result = await onImport(feeds);
      setSuccess(result);
      // Auto-close after 2 seconds on success
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Import error:', err);
      setError(err.message || 'Failed to import OPML file. Please check the file format.');
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handlePasteOPML = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text.includes('<opml') && !text.includes('<OPML')) {
        setError('Clipboard does not contain valid OPML content');
        return;
      }
      
      setError(null);
      setSuccess(null);
      setLoading(true);

      const { parseOPML } = await import('../utils/opmlParser');
      const feeds = parseOPML(text);
      const result = await onImport(feeds);
      setSuccess(result);
      setTimeout(() => onClose(), 2000);
    } catch (err) {
      // If clipboard API fails, show a textarea for manual paste
      if (err.name === 'NotAllowedError' || err.name === 'NotFoundError') {
        setShowTextarea(true);
        setError(null);
      } else {
        setError(err.message || 'Failed to import from clipboard');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTextareaImport = async () => {
    if (!opmlText.trim()) {
      setError('Please paste OPML content');
      return;
    }

    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const { parseOPML } = await import('../utils/opmlParser');
      const feeds = parseOPML(opmlText);
      const result = await onImport(feeds);
      setSuccess(result);
      setTimeout(() => onClose(), 2000);
    } catch (err) {
      setError(err.message || 'Failed to parse OPML content');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content import-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Import OPML File</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-form">
          {error && (
            <div className="form-error">{error}</div>
          )}
          {success && (
            <div className="form-success">
              ✅ Successfully imported {success.added} feeds
              {success.skipped > 0 && ` (${success.skipped} skipped - already exist)`}
            </div>
          )}
          
          <div className="import-options">
            <div className="import-option">
              <label htmlFor="opml-file" className="file-label">
                <input
                  ref={fileInputRef}
                  id="opml-file"
                  type="file"
                  accept=".opml,.xml"
                  onChange={handleFileSelect}
                  disabled={loading}
                  style={{ display: 'none' }}
                />
                <div className="file-input-button">
                  📁 Choose OPML File
                </div>
              </label>
              <p className="import-hint">Select an OPML file from your computer</p>
            </div>

            <div className="import-divider">OR</div>

            <div className="import-option">
              {!showTextarea ? (
                <>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handlePasteOPML}
                    disabled={loading}
                  >
                    📋 Paste from Clipboard
                  </button>
                  <p className="import-hint">Paste OPML content from clipboard</p>
                </>
              ) : (
                <div style={{ width: '100%' }}>
                  <textarea
                    value={opmlText}
                    onChange={(e) => setOpmlText(e.target.value)}
                    placeholder="Paste your OPML content here..."
                    disabled={loading}
                    style={{
                      width: '100%',
                      minHeight: '200px',
                      padding: '0.75rem',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      color: 'var(--text-primary)',
                      fontFamily: 'monospace',
                      fontSize: '0.875rem',
                      resize: 'vertical'
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleTextareaImport}
                    disabled={loading || !opmlText.trim()}
                    style={{ marginTop: '0.75rem', width: '100%' }}
                  >
                    Import from Text
                  </button>
                </div>
              )}
            </div>
          </div>

          {loading && (
            <div className="import-loading">
              <div className="spinner-small"></div>
              <span>Importing feeds...</span>
            </div>
          )}

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImportOPMLModal;

