/**
 * PluginManager - Handles plugin lifecycle and lazy loading
 */

import type { BasePlugin, EditorMode } from './types';

export class PluginManager {
  private plugins: Map<EditorMode, BasePlugin> = new Map();
  private loadedBundles: Set<EditorMode> = new Set();

  constructor() {}

  /**
   * Get or load a plugin
   */
  public async getPlugin(mode: EditorMode): Promise<BasePlugin> {
    // Return cached plugin if available
    if (this.plugins.has(mode)) {
      return this.plugins.get(mode)!;
    }

    // Load and cache the plugin
    const plugin = await this.loadPlugin(mode);
    this.plugins.set(mode, plugin);
    return plugin;
  }

  /**
   * Load a plugin dynamically
   */
  private async loadPlugin(mode: EditorMode): Promise<BasePlugin> {
    switch (mode) {
      case 'mermaid':
        return await this.loadMermaidPlugin();
      case 'excalidraw':
        return await this.loadExcalidrawPlugin();
      case 'text':
      default:
        return await this.loadTextPlugin();
    }
  }

  /**
   * Load Mermaid plugin
   */
  private async loadMermaidPlugin(): Promise<BasePlugin> {
    if (!this.loadedBundles.has('mermaid')) {
      // Dynamic import for code splitting
      const { MermaidPlugin } = await import(
        /* webpackChunkName: "mermaid" */
        '../plugins/mermaid/MermaidPlugin'
      );
      this.loadedBundles.add('mermaid');
      return new MermaidPlugin();
    }

    const { MermaidPlugin } = await import('../plugins/mermaid/MermaidPlugin');
    return new MermaidPlugin();
  }

  /**
   * Load Excalidraw plugin
   */
  private async loadExcalidrawPlugin(): Promise<BasePlugin> {
    if (!this.loadedBundles.has('excalidraw')) {
      // Dynamic import for code splitting
      const { ExcalidrawPlugin } = await import(
        /* webpackChunkName: "excalidraw" */
        '../plugins/excalidraw/ExcalidrawPlugin'
      );
      this.loadedBundles.add('excalidraw');
      return new ExcalidrawPlugin();
    }

    const { ExcalidrawPlugin } = await import(
      '../plugins/excalidraw/ExcalidrawPlugin'
    );
    return new ExcalidrawPlugin();
  }

  /**
   * Load Text plugin (lightweight, always loaded)
   */
  private async loadTextPlugin(): Promise<BasePlugin> {
    // Text plugin is simple enough to not require dynamic loading
    return {
      id: 'text',
      name: 'Text Editor',
      version: '1.0.0',
      initialize: async () => {
        // No initialization needed for text
      },
      destroy: () => {
        // No cleanup needed
      },
      render: (container: HTMLElement) => {
        container.innerHTML = `
          <textarea
            id="text-editor"
            class="text-editor"
            placeholder="Start typing..."
          ></textarea>
        `;
      },
      getData: () => {
        const textarea = document.getElementById(
          'text-editor'
        ) as HTMLTextAreaElement;
        return {
          type: 'text' as const,
          content: {
            type: 'text' as const,
            text: textarea?.value || ''
          }
        };
      },
      setData: (data) => {
        const textarea = document.getElementById(
          'text-editor'
        ) as HTMLTextAreaElement;
        if (textarea && data.content.type === 'text') {
          textarea.value = data.content.text || '';
        }
      },
      onDataChange: (callback) => {
        const textarea = document.getElementById('text-editor');
        if (textarea) {
          textarea.addEventListener('input', () => {
            const data = {
              type: 'text' as const,
              content: {
                type: 'text' as const,
                text: (textarea as HTMLTextAreaElement).value
              }
            };
            callback(data);
          });
        }
      }
    };
  }

  /**
   * Unload a plugin
   */
  public unloadPlugin(mode: EditorMode): void {
    const plugin = this.plugins.get(mode);
    if (plugin) {
      plugin.destroy();
      this.plugins.delete(mode);
    }
  }

  /**
   * Unload all plugins
   */
  public unloadAll(): void {
    this.plugins.forEach((plugin) => {
      plugin.destroy();
    });
    this.plugins.clear();
    this.loadedBundles.clear();
  }
}