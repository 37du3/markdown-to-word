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
                <span className="tab-icon">🚀</span>
                <span className="tab-label">快速</span>
            </button>
            <button
                className={`tab-button ${activeTab === 'editor' ? 'active' : ''}`}
                onClick={() => onTabChange('editor')}
                aria-selected={activeTab === 'editor'}
            >
                <span className="tab-icon">📝</span>
                <span className="tab-label">编辑</span>
            </button>
        </nav>
    );
}
