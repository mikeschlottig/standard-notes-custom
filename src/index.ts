/**
 * Main entry point for Standard Notes Enhanced Editor
 */

import { EditorCore } from './editor/EditorCore';
import './styles/main.scss';

// Initialize the editor when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

function init() {
  const container = document.getElementById('app');

  if (!container) {
    console.error('App container not found');
    return;
  }

  const editor = new EditorCore(container, {
    autoSave: true,
    autoSaveDelay: 500,
    theme: 'light',
    enableTelemetry: false
  });

  editor.initialize();

  // Expose editor for debugging
  if (process.env.NODE_ENV === 'development') {
    (window as any).editor = editor;
  }
}

// Export for use as library
export { EditorCore };
export default EditorCore;