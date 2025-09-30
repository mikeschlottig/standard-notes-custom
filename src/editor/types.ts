/**
 * Core Type Definitions for Enhanced Editor
 */

export type EditorMode = 'text' | 'mermaid' | 'excalidraw';

export interface BasePlugin {
  id: string;
  name: string;
  version: string;
  initialize(): Promise<void>;
  destroy(): void;
  render(container: HTMLElement): void;
  getData(): PluginData;
  setData(data: PluginData): void;
  onDataChange?(callback: (data: PluginData) => void): void;
}

export interface MermaidPlugin extends BasePlugin {
  id: 'mermaid';
  renderDiagram(code: string): Promise<void>;
  validateSyntax(code: string): ValidationResult;
  exportSVG(): Promise<string>;
}

export interface ExcalidrawPlugin extends BasePlugin {
  id: 'excalidraw';
  getScene(): readonly any[];
  setScene(elements: readonly any[]): void;
  exportPNG(): Promise<Blob>;
  exportSVG(): Promise<string>;
}

export interface PluginData {
  type: EditorMode;
  content: ContentData;
  metadata?: Record<string, any>;
}

export type ContentData = TextContent | MermaidContent | ExcalidrawContent;

export interface TextContent {
  type: 'text';
  text: string;
}

export interface MermaidContent {
  type: 'mermaid';
  code: string;
  diagramType?: string;
}

export interface ExcalidrawContent {
  type: 'excalidraw';
  elements: readonly any[];
  appState?: any;
}

export interface EditorData {
  mode: EditorMode;
  content: ContentData;
  metadata: MetaData;
}

export interface MetaData {
  version: string;
  lastMode: EditorMode;
  created: number;
  modified: number;
}

export interface ValidationResult {
  valid: boolean;
  errors?: ValidationError[];
}

export interface ValidationError {
  line?: number;
  column?: number;
  message: string;
  severity: 'error' | 'warning';
}

export interface EditorConfig {
  autoSave: boolean;
  autoSaveDelay: number;
  theme: 'light' | 'dark';
  enableTelemetry: boolean;
}

export interface EditorState {
  currentMode: EditorMode;
  activePlugin: BasePlugin | null;
  data: EditorData;
  config: EditorConfig;
  isInitialized: boolean;
  isSaving: boolean;
}

export interface ErrorContext {
  component: string;
  operation: string;
  critical: boolean;
  metadata?: Record<string, any>;
}

export interface NotificationOptions {
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  action?: {
    label: string;
    handler: () => void;
  };
  duration?: number;
}

// Standard Notes ComponentRelay Types
export interface ComponentRelayMessage {
  action: string;
  data?: any;
  messageId?: string;
}

export interface StandardNotesAPI {
  streamContextItem(callback: (item: NoteItem) => void): void;
  saveItem(item: NoteItem): Promise<void>;
  setComponentData(data: any): void;
  clearComponentData(): void;
}

export interface NoteItem {
  uuid: string;
  content_type: string;
  content: {
    text?: string;
    title?: string;
    [key: string]: any;
  };
  created_at: string;
  updated_at: string;
}