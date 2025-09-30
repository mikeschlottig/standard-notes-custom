/**
 * Excalidraw Plugin - Interactive drawing editor
 */

import { Excalidraw } from '@excalidraw/excalidraw';
import type { ExcalidrawPlugin as IExcalidrawPlugin, PluginData } from '../../editor/types';

export class ExcalidrawPlugin implements IExcalidrawPlugin {
  public readonly id = 'excalidraw' as const;
  public readonly name = 'Excalidraw Drawing Editor';
  public readonly version = '1.0.0';

  private container: HTMLElement | null = null;
  private elements: readonly any[] = [];
  private appState: any = null;
  private changeCallback: ((data: PluginData) => void) | null = null;
  private excalidrawAPI: any = null;

  constructor() {}

  /**
   * Initialize Excalidraw
   */
  public async initialize(): Promise<void> {
    // Excalidraw initializes when rendering
  }

  /**
   * Destroy and cleanup
   */
  public destroy(): void {
    this.container = null;
    this.changeCallback = null;
    this.excalidrawAPI = null;
  }

  /**
   * Render the plugin UI
   */
  public render(container: HTMLElement): void {
    this.container = container;

    // Create Excalidraw container
    const excalidrawContainer = document.createElement('div');
    excalidrawContainer.id = 'excalidraw-container';
    excalidrawContainer.style.height = '600px';
    excalidrawContainer.style.width = '100%';

    container.innerHTML = '';
    container.appendChild(excalidrawContainer);

    // Render Excalidraw
    this.renderExcalidraw(excalidrawContainer);
  }

  /**
   * Render Excalidraw component
   */
  private async renderExcalidraw(container: HTMLElement): Promise<void> {
    try {
      // Import React and ReactDOM dynamically
      const React = await import('react');
      const ReactDOM = await import('react-dom/client');

      const root = ReactDOM.createRoot(container);

      root.render(
        React.createElement(Excalidraw, {
          initialData: {
            elements: this.elements,
            appState: this.appState || {
              viewBackgroundColor: '#ffffff'
            }
          },
          onChange: (elements: readonly any[], appState: any) => {
            this.elements = elements;
            this.appState = appState;
            this.notifyChange();
          },
          ref: (api: any) => {
            if (api) {
              this.excalidrawAPI = api;
            }
          }
        })
      );
    } catch (error) {
      console.error('Excalidraw render error:', error);
      container.innerHTML = `<div class="excalidraw-error">Failed to load Excalidraw: ${(error as Error).message}</div>`;
    }
  }

  /**
   * Get scene elements
   */
  public getScene(): readonly any[] {
    return this.elements;
  }

  /**
   * Set scene elements
   */
  public setScene(elements: readonly any[]): void {
    this.elements = elements;

    if (this.excalidrawAPI) {
      this.excalidrawAPI.updateScene({
        elements: elements
      });
    }
  }

  /**
   * Export as PNG
   */
  public async exportPNG(): Promise<Blob> {
    if (!this.excalidrawAPI) {
      throw new Error('Excalidraw API not initialized');
    }

    try {
      const { exportToBlob } = await import('@excalidraw/excalidraw');

      const blob = await exportToBlob({
        elements: this.elements,
        appState: this.appState,
        files: null
      });

      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'drawing.png';
      a.click();
      URL.revokeObjectURL(url);

      return blob;
    } catch (error) {
      console.error('Export PNG error:', error);
      throw error;
    }
  }

  /**
   * Export as SVG
   */
  public async exportSVG(): Promise<string> {
    if (!this.excalidrawAPI) {
      throw new Error('Excalidraw API not initialized');
    }

    try {
      const { exportToSvg } = await import('@excalidraw/excalidraw');

      const svg = await exportToSvg({
        elements: this.elements,
        appState: this.appState,
        files: null
      });

      const svgString = svg.outerHTML;

      // Create download link
      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'drawing.svg';
      a.click();
      URL.revokeObjectURL(url);

      return svgString;
    } catch (error) {
      console.error('Export SVG error:', error);
      throw error;
    }
  }

  /**
   * Get plugin data
   */
  public getData(): PluginData {
    return {
      type: 'excalidraw',
      content: {
        type: 'excalidraw',
        elements: this.elements,
        appState: this.appState
      }
    };
  }

  /**
   * Set plugin data
   */
  public setData(data: PluginData): void {
    if (data.content.type === 'excalidraw') {
      this.elements = data.content.elements || [];
      this.appState = data.content.appState || null;

      if (this.excalidrawAPI) {
        this.excalidrawAPI.updateScene({
          elements: this.elements,
          appState: this.appState
        });
      }
    }
  }

  /**
   * Register data change callback
   */
  public onDataChange(callback: (data: PluginData) => void): void {
    this.changeCallback = callback;
  }

  /**
   * Notify data change
   */
  private notifyChange(): void {
    if (this.changeCallback) {
      this.changeCallback(this.getData());
    }
  }
}