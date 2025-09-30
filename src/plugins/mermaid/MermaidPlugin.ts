/**
 * Mermaid Plugin - Renders Mermaid diagrams
 */

import mermaid from 'mermaid';
import type { MermaidPlugin as IMermaidPlugin, PluginData, ValidationResult } from '../../editor/types';

export class MermaidPlugin implements IMermaidPlugin {
  public readonly id = 'mermaid' as const;
  public readonly name = 'Mermaid Diagram Editor';
  public readonly version = '1.0.0';

  private container: HTMLElement | null = null;
  private code: string = '';
  private changeCallback: ((data: PluginData) => void) | null = null;
  private debounceTimer: NodeJS.Timeout | null = null;

  constructor() {}

  /**
   * Initialize Mermaid
   */
  public async initialize(): Promise<void> {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'strict',
      fontFamily: 'monospace'
    });
  }

  /**
   * Destroy and cleanup
   */
  public destroy(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.container = null;
    this.changeCallback = null;
  }

  /**
   * Render the plugin UI
   */
  public render(container: HTMLElement): void {
    this.container = container;

    container.innerHTML = `
      <div class="mermaid-editor">
        <div class="mermaid-editor-split">
          <div class="mermaid-code-panel">
            <textarea
              id="mermaid-code"
              class="mermaid-textarea"
              placeholder="graph TD\n  A[Start] --> B[Process]\n  B --> C[End]"
            >${this.code}</textarea>
            <div class="mermaid-validation" id="mermaid-validation"></div>
          </div>
          <div class="mermaid-preview-panel">
            <div id="mermaid-preview" class="mermaid-preview"></div>
          </div>
        </div>
        <div class="mermaid-toolbar">
          <button class="btn-export-svg">Export SVG</button>
          <button class="btn-export-png">Export PNG</button>
        </div>
      </div>
    `;

    this.attachEventListeners();

    // Initial render if there's code
    if (this.code) {
      this.renderDiagram(this.code);
    }
  }

  /**
   * Attach event listeners
   */
  private attachEventListeners(): void {
    const textarea = document.getElementById('mermaid-code') as HTMLTextAreaElement;
    if (textarea) {
      textarea.addEventListener('input', () => {
        this.code = textarea.value;
        this.debouncedRender();
        this.notifyChange();
      });
    }

    const exportSvgBtn = this.container?.querySelector('.btn-export-svg');
    if (exportSvgBtn) {
      exportSvgBtn.addEventListener('click', () => {
        this.exportSVG();
      });
    }

    const exportPngBtn = this.container?.querySelector('.btn-export-png');
    if (exportPngBtn) {
      exportPngBtn.addEventListener('click', () => {
        this.exportPNG();
      });
    }
  }

  /**
   * Debounced render
   */
  private debouncedRender(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.renderDiagram(this.code);
    }, 300);
  }

  /**
   * Render Mermaid diagram
   */
  public async renderDiagram(code: string): Promise<void> {
    const previewElement = document.getElementById('mermaid-preview');
    if (!previewElement) return;

    try {
      // Validate syntax first
      const validation = this.validateSyntax(code);
      this.showValidation(validation);

      if (!validation.valid) {
        previewElement.innerHTML = '<div class="mermaid-error">Invalid diagram syntax</div>';
        return;
      }

      // Render the diagram
      const { svg } = await mermaid.render('mermaid-diagram', code);
      previewElement.innerHTML = svg;
    } catch (error) {
      console.error('Mermaid render error:', error);
      previewElement.innerHTML = `<div class="mermaid-error">Error rendering diagram: ${(error as Error).message}</div>`;
      this.showValidation({
        valid: false,
        errors: [{
          message: (error as Error).message,
          severity: 'error'
        }]
      });
    }
  }

  /**
   * Validate Mermaid syntax
   */
  public validateSyntax(code: string): ValidationResult {
    if (!code.trim()) {
      return { valid: false, errors: [{ message: 'Empty diagram', severity: 'warning' }] };
    }

    try {
      // Basic validation - check if it starts with a valid diagram type
      const validTypes = ['graph', 'flowchart', 'sequenceDiagram', 'classDiagram', 'stateDiagram',
                         'erDiagram', 'journey', 'gantt', 'pie', 'gitGraph', 'mindmap', 'quadrantChart'];
      const firstLine = code.trim().split('\n')[0].toLowerCase();
      const hasValidType = validTypes.some(type => firstLine.includes(type.toLowerCase()));

      if (!hasValidType) {
        return {
          valid: false,
          errors: [{
            line: 1,
            message: 'Diagram must start with a valid type (graph, sequenceDiagram, etc.)',
            severity: 'error'
          }]
        };
      }

      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        errors: [{
          message: (error as Error).message,
          severity: 'error'
        }]
      };
    }
  }

  /**
   * Show validation messages
   */
  private showValidation(validation: ValidationResult): void {
    const validationElement = document.getElementById('mermaid-validation');
    if (!validationElement) return;

    if (validation.valid) {
      validationElement.innerHTML = '<div class="validation-success">✓ Valid diagram</div>';
    } else if (validation.errors) {
      const errorsHtml = validation.errors
        .map(err => `<div class="validation-${err.severity}">${err.message}</div>`)
        .join('');
      validationElement.innerHTML = errorsHtml;
    }
  }

  /**
   * Export diagram as SVG
   */
  public async exportSVG(): Promise<string> {
    try {
      const { svg } = await mermaid.render('export-diagram', this.code);

      // Create download link
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'diagram.svg';
      a.click();
      URL.revokeObjectURL(url);

      return svg;
    } catch (error) {
      console.error('Export SVG error:', error);
      throw error;
    }
  }

  /**
   * Export diagram as PNG
   */
  private async exportPNG(): Promise<void> {
    try {
      const svg = await this.exportSVG();

      // Convert SVG to PNG using canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);

        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'diagram.png';
            a.click();
            URL.revokeObjectURL(url);
          }
        });
      };

      img.src = 'data:image/svg+xml;base64,' + btoa(svg);
    } catch (error) {
      console.error('Export PNG error:', error);
    }
  }

  /**
   * Get plugin data
   */
  public getData(): PluginData {
    return {
      type: 'mermaid',
      content: {
        type: 'mermaid',
        code: this.code
      }
    };
  }

  /**
   * Set plugin data
   */
  public setData(data: PluginData): void {
    if (data.content.type === 'mermaid') {
      this.code = data.content.code || '';

      const textarea = document.getElementById('mermaid-code') as HTMLTextAreaElement;
      if (textarea) {
        textarea.value = this.code;
      }

      if (this.code) {
        this.renderDiagram(this.code);
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