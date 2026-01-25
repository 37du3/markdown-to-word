import React from 'react';
import { Header } from './components/Header';
import { MainView } from './components/MainView';
import './styles/popup.css';

export default function PopupApp() {
    return (
        <div className="popup-container">
            <Header />
            <main className="popup-main">
                <MainView />
            </main>
        </div>
    );
}
