/**
 * ComponentRelay - Standard Notes API integration
 */

import type { EditorData, NoteItem, StandardNotesAPI } from '../editor/types';

export class ComponentRelay {
  private componentManager: StandardNotesAPI | null = null;
  private currentNote: NoteItem | null = null;
  private noteLoadCallback: ((data: EditorData) => void) | null = null;

  constructor() {}

  /**
   * Initialize connection to Standard Notes
   */
  public async initialize(): Promise<void> {
    // In a real Standard Notes extension, this would initialize the ComponentRelay
    // For development/testing, we'll use localStorage

    if (typeof window !== 'undefined' && (window as any).componentRelay) {
      this.componentManager = (window as any).componentRelay;

      // Listen for note stream
      this.componentManager?.streamContextItem((item: NoteItem) => {
        this.currentNote = item;
        this.handleNoteLoad(item);
      });
    } else {
      console.warn('ComponentRelay not available - running in standalone mode');
    }
  }

  /**
   * Handle note load from Standard Notes
   */
  private handleNoteLoad(item: NoteItem): void {
    if (!item.content) return;

    try {
      // Parse editor data from note content
      const editorData: EditorData = typeof item.content === 'string'
        ? JSON.parse(item.content)
        : item.content;

      if (this.noteLoadCallback) {
        this.noteLoadCallback(editorData);
      }
    } catch (error) {
      console.error('Error parsing note content:', error);
    }
  }

  /**
   * Register callback for note load
   */
  public onNoteLoad(callback: (data: EditorData) => void): void {
    this.noteLoadCallback = callback;
  }

  /**
   * Load note data
   */
  public async loadNote(): Promise<EditorData | null> {
    if (this.componentManager && this.currentNote) {
      try {
        const editorData: EditorData = typeof this.currentNote.content === 'string'
          ? JSON.parse(this.currentNote.content as string)
          : this.currentNote.content as any;

        return editorData;
      } catch (error) {
        console.error('Error loading note:', error);
        return null;
      }
    }

    // Fallback to localStorage for development
    return this.loadFromLocalStorage();
  }

  /**
   * Save note data to Standard Notes
   */
  public async saveNote(data: EditorData): Promise<void> {
    if (this.componentManager && this.currentNote) {
      try {
        const updatedNote: NoteItem = {
          ...this.currentNote,
          content: data as any,
          updated_at: new Date().toISOString()
        };

        await this.componentManager.saveItem(updatedNote);
      } catch (error) {
        console.error('Error saving note:', error);
        throw error;
      }
    } else {
      // Fallback to localStorage for development
      this.saveToLocalStorage(data);
    }
  }

  /**
   * Load from localStorage (development fallback)
   */
  private loadFromLocalStorage(): EditorData | null {
    try {
      const saved = localStorage.getItem('enhanced-editor-data');
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return null;
    }
  }

  /**
   * Save to localStorage (development fallback)
   */
  private saveToLocalStorage(data: EditorData): void {
    try {
      localStorage.setItem('enhanced-editor-data', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  /**
   * Destroy and cleanup
   */
  public destroy(): void {
    this.componentManager = null;
    this.currentNote = null;
    this.noteLoadCallback = null;
  }
}