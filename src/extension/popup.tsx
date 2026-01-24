import React from 'react';
import ReactDOM from 'react-dom/client';
import { PopupApp } from './popup/PopupApp';

const root = document.getElementById('root');
if (root) {
    ReactDOM.createRoot(root).render(
        <React.StrictMode>
            <PopupApp />
        </React.StrictMode>
    );
}
