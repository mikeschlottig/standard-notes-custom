/**
 * EditorCore - Main orchestrator for the enhanced editor
 */

import { PluginManager } from './PluginManager';
import { ComponentRelay } from '../api/ComponentRelay';
import { debounce } from '../utils/debounce';
import type {
  EditorMode,
  EditorData,
  EditorState,
  EditorConfig,
  BasePlugin,
  NotificationOptions,
  ErrorContext
} from './types';

export class EditorCore {
  private pluginManager: PluginManager;
  private componentRelay: ComponentRelay;
  private state: EditorState;
  private container: HTMLElement;
  private autoSaveHandler: ReturnType<typeof debounce>;

  constructor(container: HTMLElement, config?: Partial<EditorConfig>) {
    this.container = container;
    this.pluginManager = new PluginManager();
    this.componentRelay = new ComponentRelay();

    this.state = {
      currentMode: 'text',
      activePlugin: null,
      data: this.getDefaultData(),
      config: {
        autoSave: true,
        autoSaveDelay: 500,
        theme: 'light',
        enableTelemetry: false,
        ...config
      },
      isInitialized: false,
      isSaving: false
    };

    this.autoSaveHandler = debounce(
      () => this.saveData(),
      this.state.config.autoSaveDelay
    );
  }

  /**
   * Initialize the editor
   */
  public async initialize(): Promise<void> {
    try {
      // Initialize ComponentRelay for Standard Notes integration
      await this.componentRelay.initialize();

      // Listen for note data from Standard Notes
      this.componentRelay.onNoteLoad((data) => {
        this.loadNoteData(data);
      });

      // Render the UI
      this.renderUI();

      // Load initial data or default state
      await this.loadInitialData();

      this.state.isInitialized = true;
    } catch (error) {
      this.handleError(error as Error, {
        component: 'EditorCore',
        operation: 'initialize',
        critical: true
      });
    }
  }

  /**
   * Switch editor mode
   */
  public async switchMode(mode: EditorMode): Promise<void> {
    if (this.state.currentMode === mode) return;

    try {
      // Save current plugin state
      if (this.state.activePlugin) {
        const currentData = this.state.activePlugin.getData();
        this.updateContent(currentData);
      }

      // Clean up current plugin
      await this.cleanupCurrentPlugin();

      // Load and initialize new plugin
      const plugin = await this.pluginManager.getPlugin(mode);
      await plugin.initialize();

      // Restore plugin data if available
      const modeContent = this.state.data.content;
      if (modeContent.type === mode) {
        plugin.setData({
          type: mode,
          content: modeContent
        });
      }

      // Render the plugin
      const pluginContainer = this.getPluginContainer();
      plugin.render(pluginContainer);

      // Setup data change listener
      if (plugin.onDataChange) {
        plugin.onDataChange((data) => {
          this.updateContent(data);
          if (this.state.config.autoSave) {
            this.autoSaveHandler();
          }
        });
      }

      // Update state
      this.state.currentMode = mode;
      this.state.activePlugin = plugin;
      this.state.data.mode = mode;
      this.state.data.metadata.lastMode = mode;
      this.state.data.metadata.modified = Date.now();

      // Update UI
      this.updateModeSelector();

    } catch (error) {
      this.handleError(error as Error, {
        component: 'EditorCore',
        operation: 'switchMode',
        critical: false,
        metadata: { mode }
      });

      // Fallback to text mode on error
      if (mode !== 'text') {
        await this.switchMode('text');
      }
    }
  }

  /**
   * Save current data to Standard Notes
   */
  private async saveData(): Promise<void> {
    if (this.state.isSaving) return;

    try {
      this.state.isSaving = true;

      // Get latest data from active plugin
      if (this.state.activePlugin) {
        const pluginData = this.state.activePlugin.getData();
        this.updateContent(pluginData);
      }

      // Update metadata
      this.state.data.metadata.modified = Date.now();

      // Save to Standard Notes
      await this.componentRelay.saveNote(this.state.data);

      this.showNotification({
        type: 'success',
        message: 'Saved',
        duration: 2000
      });

    } catch (error) {
      this.handleError(error as Error, {
        component: 'EditorCore',
        operation: 'saveData',
        critical: false
      });
    } finally {
      this.state.isSaving = false;
    }
  }

  /**
   * Load initial data
   */
  private async loadInitialData(): Promise<void> {
    const savedData = await this.componentRelay.loadNote();

    if (savedData) {
      this.state.data = savedData;
      await this.switchMode(savedData.mode || 'text');
    } else {
      await this.switchMode('text');
    }
  }

  /**
   * Load note data from Standard Notes
   */
  private async loadNoteData(data: EditorData): Promise<void> {
    this.state.data = data;
    await this.switchMode(data.mode || 'text');
  }

  /**
   * Update content in state
   */
  private updateContent(pluginData: any): void {
    this.state.data.content = pluginData.content;
  }

  /**
   * Cleanup current plugin
   */
  private async cleanupCurrentPlugin(): Promise<void> {
    if (this.state.activePlugin) {
      try {
        this.state.activePlugin.destroy();
      } catch (error) {
        console.error('Error cleaning up plugin:', error);
      }
      this.state.activePlugin = null;
    }
  }

  /**
   * Render the UI
   */
  private renderUI(): void {
    this.container.innerHTML = `
      <div class="enhanced-editor">
        <div class="editor-toolbar">
          <div class="mode-selector">
            <button class="mode-btn" data-mode="text">Text</button>
            <button class="mode-btn" data-mode="mermaid">Mermaid</button>
            <button class="mode-btn" data-mode="excalidraw">Excalidraw</button>
          </div>
          <div class="editor-actions">
            <button class="save-btn">Save</button>
          </div>
        </div>
        <div class="editor-content" id="plugin-container"></div>
        <div class="editor-notifications" id="notifications"></div>
      </div>
    `;

    // Attach event listeners
    this.attachEventListeners();
  }

  /**
   * Attach event listeners
   */
  private attachEventListeners(): void {
    // Mode selector buttons
    const modeButtons = this.container.querySelectorAll('.mode-btn');
    modeButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const mode = btn.getAttribute('data-mode') as EditorMode;
        this.switchMode(mode);
      });
    });

    // Save button
    const saveBtn = this.container.querySelector('.save-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        this.saveData();
      });
    }
  }

  /**
   * Update mode selector UI
   */
  private updateModeSelector(): void {
    const modeButtons = this.container.querySelectorAll('.mode-btn');
    modeButtons.forEach((btn) => {
      const mode = btn.getAttribute('data-mode');
      if (mode === this.state.currentMode) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  /**
   * Get plugin container element
   */
  private getPluginContainer(): HTMLElement {
    const container = this.container.querySelector('#plugin-container');
    if (!container) {
      throw new Error('Plugin container not found');
    }
    return container as HTMLElement;
  }

  /**
   * Show notification to user
   */
  private showNotification(options: NotificationOptions): void {
    const notificationContainer = this.container.querySelector('#notifications');
    if (!notificationContainer) return;

    const notification = document.createElement('div');
    notification.className = `notification notification-${options.type}`;
    notification.textContent = options.message;

    notificationContainer.appendChild(notification);

    const duration = options.duration || 3000;
    setTimeout(() => {
      notification.remove();
    }, duration);
  }

  /**
   * Handle errors
   */
  private handleError(error: Error, context: ErrorContext): void {
    console.error(`[${context.component}] ${error.message}`, error);

    const userMessage = this.getUserFriendlyMessage(error);
    this.showNotification({
      type: 'error',
      message: userMessage,
      action: context.critical ? undefined : {
        label: 'Retry',
        handler: () => {
          // Retry logic based on operation
        }
      }
    });

    if (context.critical) {
      // Fallback to text mode on critical errors
      this.switchMode('text');
    }
  }

  /**
   * Get user-friendly error message
   */
  private getUserFriendlyMessage(error: Error): string {
    // Map technical errors to user-friendly messages
    const errorMessages: Record<string, string> = {
      'Plugin load failed': 'Failed to load editor plugin',
      'Network error': 'Connection issue, please try again',
      'Invalid data': 'Unable to load note data'
    };

    return errorMessages[error.message] || 'An error occurred';
  }

  /**
   * Get default editor data
   */
  private getDefaultData(): EditorData {
    return {
      mode: 'text',
      content: {
        type: 'text',
        text: ''
      },
      metadata: {
        version: '1.0.0',
        lastMode: 'text',
        created: Date.now(),
        modified: Date.now()
      }
    };
  }

  /**
   * Destroy the editor
   */
  public destroy(): void {
    this.cleanupCurrentPlugin();
    this.componentRelay.destroy();
  }
}