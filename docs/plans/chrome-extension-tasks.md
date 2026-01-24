# Chrome Extension Development Task List

- [x] **Planning & Architecture**
    - [x] Determine project structure (Single Repo, Multi-Target)
    - [x] Analyze PasteMD for borrowable features
    - [x] Create detailed implementation plan

- [ ] **Phase 1: Project Setup**
    - [ ] Create `src/extension/manifest.json`
    - [ ] Configure `vite.config.ts` for extension build
    - [ ] Add `build:ext` script to `package.json`
    - [ ] Install `@types/chrome`

- [ ] **Phase 2: Core Extension**
    - [ ] Create `popup.tsx` (Popup UI)
    - [ ] Create `background.ts` (Service Worker)
    - [ ] Create `content.ts` (Page scraper)

- [x] **Phase 3: PasteMD-Inspired Features**
    - [x] Add AI content preprocessor
    - [x] Add keyboard shortcut support
    - [x] Add notification on completion
    - [x] Add i18n support

- [ ] **Phase 4: Release**
    - [ ] Create `release-extension.yml` workflow
    - [ ] Build & test locally
    - [ ] Publish first release

