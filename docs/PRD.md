# Product Requirements Document (PRD)
## Standard Notes Enhanced Editor with Mermaid & Excalidraw Integration

**Version:** 1.0
**Date:** 2025-09-29
**Status:** Planning Phase

---

## SECTION 1: PRODUCT OVERVIEW

### Vision
Create a powerful, unified Standard Notes editor that integrates both Mermaid diagram capabilities and Excalidraw drawing tools into a single, cohesive editing experience.

### Goals
1. Seamless integration of Mermaid and Excalidraw within Standard Notes
2. Maintain end-to-end encryption compatibility
3. Provide intuitive plugin switching and management
4. Ensure high-quality, production-ready code from the start
5. Deploy to multiple platforms (local, GitHub, Cloudflare Workers)

### Success Metrics
- Extension loads successfully in Standard Notes
- Both plugins function without conflicts
- User can switch between text, Mermaid, and Excalidraw modes
- All data persists correctly through Standard Notes sync
- Performance: <100ms plugin switching time
- Zero data loss during mode transitions

### Target Users
- Standard Notes power users
- Technical documentation writers
- Visual thinkers and designers
- Developers documenting system architectures

---

## SECTION 2: FUNCTIONAL REQUIREMENTS

### Core Features

#### 2.1 Editor Core
**FR-001: Multi-Mode Editor**
- User can switch between three modes: Text, Mermaid, Excalidraw
- Mode selection persists with the note
- Switching modes preserves all data

**FR-002: Standard Notes Integration**
- Extension communicates via ComponentRelay API
- Handles note save/load events
- Supports Standard Notes encryption
- Responds to theme changes

**FR-003: Plugin Management**
- PluginManager orchestrates plugin lifecycle
- Lazy loading of plugin resources
- Clean plugin initialization/destruction
- Error isolation between plugins

#### 2.2 Mermaid Plugin
**FR-004: Diagram Types Support**
- Flow diagrams
- Sequence diagrams
- Class diagrams
- State diagrams
- Gantt charts
- Pie charts
- ER diagrams
- User Journey diagrams
- Git graphs
- Mindmaps
- Quadrant charts

**FR-005: Mermaid Editor Features**
- Live preview of diagrams
- Syntax validation
- Error highlighting
- Export diagram as SVG/PNG
- Dark/light theme support

#### 2.3 Excalidraw Plugin
**FR-006: Drawing Tools**
- Free-hand drawing
- Shapes (rectangles, circles, arrows, lines)
- Text annotations
- Image embedding
- Collaboration-ready format

**FR-007: Excalidraw Editor Features**
- Full Excalidraw feature set
- Export as PNG/SVG/JSON
- Import Excalidraw files
- Undo/redo support
- Dark/light theme support

---

## SECTION 3: TECHNICAL REQUIREMENTS

### Architecture

**TR-001: Technology Stack**
- TypeScript (strict mode)
- Webpack 5 for bundling
- Babel for transpilation
- SCSS for styling
- Jest for testing

**TR-002: Dependencies**
- `mermaid`: ^10.x.x
- `@excalidraw/excalidraw`: ^0.x.x
- Standard Notes types/interfaces

**TR-003: Build Outputs**
- `dist/index.js`: Main bundle
- `dist/index.css`: Styles bundle
- `public/extension.json`: Extension manifest
- Source maps for debugging

**TR-004: Browser Compatibility**
- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES2020+ features
- No IE11 support required

### Data Management

**TR-005: Storage Format**
```typescript
interface EditorData {
  mode: 'text' | 'mermaid' | 'excalidraw';
  content: {
    text?: string;
    mermaid?: string;
    excalidraw?: ExcalidrawElement[];
  };
  metadata: {
    version: string;
    lastMode: string;
    created: number;
    modified: number;
  };
}
```

**TR-006: Data Persistence**
- Automatic save on content change (debounced 500ms)
- Validate data before save
- Graceful handling of corrupt data
- Migration strategy for format changes

### Performance

**TR-007: Bundle Size**
- Total bundle: <500KB gzipped
- Lazy load plugins: Load Mermaid/Excalidraw only when needed
- Code splitting for optimal loading

**TR-008: Runtime Performance**
- Initial load: <200ms
- Mode switching: <100ms
- Rendering: 60fps for interactions
- Memory: <50MB typical usage

---

## SECTION 4: TESTING & DEPLOYMENT

### Testing Strategy

**TS-001: Unit Tests**
- EditorCore logic: 90%+ coverage
- PluginManager: 90%+ coverage
- ComponentRelay API wrapper: 85%+ coverage
- Utility functions: 95%+ coverage

**TS-002: Integration Tests**
- Plugin loading/unloading
- Mode switching workflows
- Data persistence flows
- Standard Notes API communication

**TS-003: End-to-End Tests**
- Full user workflows
- Cross-browser testing
- Performance benchmarking
- Error scenarios

### Deployment Pipeline

**DP-001: Local Development**
```bash
npm install
npm run dev
# Opens localhost:8080 with hot reload
```

**DP-002: GitHub Repository**
- Repository: `mikeschlottig/standard-notes-enhanced-editor`
- Automated CI/CD via GitHub Actions
- Semantic versioning
- Automated changelog generation

**DP-003: Cloudflare Workers Deployment**
- Static hosting on Cloudflare Pages
- CDN distribution
- Extension JSON hosted at predictable URL
- Automated deployment on git push to main

### User Journeys

**UJ-001: First-Time Installation**
1. User opens Standard Notes
2. Navigates to Extensions
3. Pastes extension JSON URL
4. Extension installs and appears in editor list
5. User creates new note with enhanced editor
6. Sees mode selector (Text/Mermaid/Excalidraw)

**UJ-002: Creating Mermaid Diagram**
1. User opens note with enhanced editor
2. Selects "Mermaid" mode
3. Types Mermaid syntax
4. Sees live preview update
5. Diagram auto-saves with note
6. Reopening note shows rendered diagram

**UJ-003: Creating Excalidraw Drawing**
1. User opens note with enhanced editor
2. Selects "Excalidraw" mode
3. Uses drawing tools to create diagram
4. Drawing auto-saves with note
5. Can switch to Text mode to add notes
6. Switching back to Excalidraw preserves drawing

**UJ-004: Error Handling - Plugin Failure**
1. Plugin encounters error during rendering
2. User sees friendly error message
3. Editor falls back to text mode
4. Data remains intact
5. User can report issue or try again
6. Other plugins continue to function

---

## CONTEXT INJECTION POINTS

**CIP-1 (Section 1):** Product vision and goals - Used for README, marketing materials, documentation
**CIP-2 (Section 2):** Functional requirements - Direct input for feature implementation
**CIP-3 (Section 3):** Technical requirements - Architecture and implementation decisions
**CIP-4 (Section 4):** Testing & deployment - CI/CD pipeline, test strategy, user flows

---

## ACCEPTANCE CRITERIA

### Must Have (MVP)
- ✅ Extension loads in Standard Notes
- ✅ Can create Mermaid diagrams
- ✅ Can create Excalidraw drawings
- ✅ Data persists across sessions
- ✅ Mode switching works correctly

### Should Have (V1.0)
- ✅ All Mermaid diagram types supported
- ✅ Full Excalidraw feature set
- ✅ Export capabilities
- ✅ Theme support (dark/light)
- ✅ Comprehensive error handling

### Could Have (Future)
- ⏳ Collaboration features
- ⏳ Template library
- ⏳ Advanced export options
- ⏳ Plugin marketplace integration

---

## RISKS & MITIGATIONS

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Excalidraw bundle size too large | High | Medium | Lazy loading, code splitting |
| Mermaid rendering performance issues | Medium | Low | Web workers for rendering |
| Standard Notes API changes | High | Low | Pin to stable API version |
| Plugin conflicts | Medium | Medium | Isolated plugin contexts |
| Data corruption during migration | High | Low | Validation, backup, rollback |

---

**Document Owner:** Mike Schlottig
**Last Updated:** 2025-09-29