import React from 'react';

export function Header() {
    return (
        <header className="popup-header">
            <h1 className="popup-title">Markdown → Word</h1>
            <button
                className="settings-btn"
                title="设置"
                aria-label="打开设置"
            >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                        d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                    />
                    <path
                        d="M17.5 10.83v-1.66l-1.88-.66a5.78 5.78 0 00-.75-1.8l.95-1.71-1.17-1.17-1.71.95a5.78 5.78 0 00-1.8-.75L10.83 2.5h-1.66l-.66 1.88a5.78 5.78 0 00-1.8.75l-1.71-.95-1.17 1.17.95 1.71a5.78 5.78 0 00-.75 1.8L2.5 9.17v1.66l1.88.66c.17.64.43 1.24.75 1.8l-.95 1.71 1.17 1.17 1.71-.95c.56.32 1.16.58 1.8.75l.66 1.88h1.66l.66-1.88a5.78 5.78 0 001.8-.75l1.71.95 1.17-1.17-.95-1.71c.32-.56.58-1.16.75-1.8l1.88-.66z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                    />
                </svg>
            </button>
        </header>
    );
}
