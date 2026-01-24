import React from 'react';
import type { TabType } from '../PopupApp';

interface TabNavigationProps {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
}

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
    return (
        <nav className="tab-navigation">
            <button
                className={`tab-button ${activeTab === 'quick' ? 'active' : ''}`}
                onClick={() => onTabChange('quick')}
                aria-selected={activeTab === 'quick'}
            >
                {/* Heroicon: bolt */}
                <svg className="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
                <span className="tab-label">快速</span>
            </button>
            <button
                className={`tab-button ${activeTab === 'editor' ? 'active' : ''}`}
                onClick={() => onTabChange('editor')}
                aria-selected={activeTab === 'editor'}
            >
                {/* Heroicon: pencil-square */}
                <svg className="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
                <span className="tab-label">编辑</span>
            </button>
        </nav>
    );
}
