import React from 'react';
import type { TabType } from '../PopupApp';

interface TabNavigationProps {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
}

const iconStyle = { width: 18, height: 18 };

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
    return (
        <nav className="tab-navigation">
            <button
                className={`tab-button ${activeTab === 'quick' ? 'active' : ''}`}
                onClick={() => onTabChange('quick')}
                aria-selected={activeTab === 'quick'}
            >
                <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="tab-label">快速</span>
            </button>
            <button
                className={`tab-button ${activeTab === 'editor' ? 'active' : ''}`}
                onClick={() => onTabChange('editor')}
                aria-selected={activeTab === 'editor'}
            >
                <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span className="tab-label">编辑</span>
            </button>
        </nav>
    );
}
