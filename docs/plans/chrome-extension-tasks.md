# Chrome Extension Development Task List

- [x] **Planning & Architecture**
    - [x] Determine project structure (Single Repo, Multi-Target)
    - [x] Analyze PasteMD for borrowable features
    - [x] Create detailed implementation plan

- [x] **Phase 1: Project Setup**
    - [x] Create `src/extension/manifest.json`
    - [x] Configure `vite.config.ts` for extension build
    - [x] Add `build:ext` script to `package.json`
    - [x] Install `@types/chrome`

- [x] **Phase 2: Core Extension**
    - [x] Create `popup.tsx` (Popup UI)
    - [x] Create `background.ts` (Service Worker)
    - [x] Create `content.ts` (Page scraper)
    - [x] Generate and add extension icons

- [ ] **Phase 3: PasteMD-Inspired Features**
    - [ ] Add AI content preprocessor
    - [ ] Add keyboard shortcut support
    - [ ] Add notification on completion
    - [ ] Add i18n support

- [ ] **Phase 4: Release**
    - [ ] Create `release-extension.yml` workflow
    - [ ] Build & test locally
    - [ ] Publish first release

