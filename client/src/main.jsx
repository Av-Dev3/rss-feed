import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './utils/errorHandler'; // Suppress expected errors
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

