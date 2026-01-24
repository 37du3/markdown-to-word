import React, { useState } from 'react';
import { Header } from './components/Header';
import { TabNavigation } from './components/TabNavigation';
import { QuickTab } from './components/QuickTab';
import { EditorTab } from './components/EditorTab';
import './styles/popup.css';
import './styles/quick-tab.css';
import './styles/editor-tab.css';

export type TabType = 'quick' | 'editor';

export function PopupApp() {
    const [activeTab, setActiveTab] = useState<TabType>('quick');

    return (
        <div className="popup-container">
            <Header />
            <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
            <div className="popup-content">
                {activeTab === 'quick' ? <QuickTab /> : <EditorTab />}
            </div>
        </div>
    );
}
