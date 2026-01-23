import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '../App';
import '../index.css';

// Extension popup entry point - reuses the main App component
ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
