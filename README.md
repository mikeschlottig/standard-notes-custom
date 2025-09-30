# Standard Notes Enhanced Editor

A powerful, unified Standard Notes editor that integrates both Mermaid diagram capabilities and Excalidraw drawing tools into a single, cohesive editing experience.

## Features

### 🎨 Multi-Mode Editor
- **Text Mode**: Traditional text editing
- **Mermaid Mode**: Create professional diagrams (flowcharts, sequence diagrams, class diagrams, etc.)
- **Excalidraw Mode**: Interactive drawing and sketching

### 📊 Mermaid Support
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

### ✏️ Excalidraw Features
- Free-hand drawing
- Shapes and annotations
- Export as PNG/SVG
- Full Excalidraw feature set

## Installation

### For Standard Notes Users

1. Open Standard Notes
2. Navigate to **Extensions** → **Import Extension**
3. Paste the extension URL:
   ```
   https://standard-notes-editor.ceo-a53.workers.dev/extension.json
   ```
4. The enhanced editor will appear in your editor list

### For Developers

```bash
# Clone the repository
git clone https://github.com/mikeschlottig/standard-notes-enhanced-editor.git
cd standard-notes-enhanced-editor

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Development

### Project Structure

```
standard-notes-enhanced-editor/
├── src/
│   ├── editor/           # Core editor logic
│   ├── plugins/          # Mermaid and Excalidraw plugins
│   ├── api/              # Standard Notes integration
│   ├── styles/           # SCSS styles
│   └── utils/            # Utility functions
├── public/
│   ├── index.html
│   └── extension.json    # Standard Notes manifest
├── docs/                 # Documentation
└── tests/                # Test suites
```

### Available Scripts

```bash
# Development
npm run dev              # Start dev server with hot reload

# Building
npm run build            # Production build

# Testing
npm test                 # Run tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report

# Code Quality
npm run lint             # Lint code
npm run format           # Format with Prettier
npm run type-check       # TypeScript type checking
```

## Architecture

### Core Components

- **EditorCore**: Main orchestrator for the editor
- **PluginManager**: Handles plugin lifecycle and lazy loading
- **ComponentRelay**: Standard Notes API integration
- **MermaidPlugin**: Renders Mermaid diagrams
- **ExcalidrawPlugin**: Interactive drawing editor

### Data Flow

1. User interacts with editor
2. Plugin captures changes
3. EditorCore debounces and saves data
4. ComponentRelay syncs to Standard Notes
5. Data persists across sessions

## Configuration

```typescript
const editor = new EditorCore(container, {
  autoSave: true,
  autoSaveDelay: 500,
  theme: 'light',
  enableTelemetry: false
});
```

## Browser Compatibility

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

- Initial bundle: <150KB gzipped
- Plugin bundles: <300KB gzipped each
- Time to Interactive: <1000ms
- Lazy loading for optimal performance

## Security

- No external API calls
- Content Security Policy compliant
- XSS prevention
- Works with Standard Notes E2E encryption

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## License

MIT License - see [LICENSE](LICENSE) for details

## Support

- GitHub Issues: https://github.com/mikeschlottig/standard-notes-enhanced-editor/issues
- Documentation: https://github.com/mikeschlottig/standard-notes-enhanced-editor/docs

## Credits

- [Standard Notes](https://standardnotes.com/) - Secure notes app
- [Mermaid](https://mermaid.js.org/) - Diagram generation
- [Excalidraw](https://excalidraw.com/) - Drawing tool

---

**Built with ❤️ by LEVERAGEAI LLC**