import { editorLivePreviewField } from 'obsidian';
import type { Editor, EditorPosition } from 'obsidian';
import type { EditorView } from '@codemirror/view';

/**
 * Service for abstracting editor operations
 */
export interface IEditorService {
	/**
	 * Get the current selection
	 */
	getSelection(): string | null;

	/**
	 * Replace the current selection with new text
	 */
	replaceSelection(text: string): void;

	/**
	 * Replace text in a range
	 */
	replaceRange(text: string, from: EditorPosition, to: EditorPosition): void;

	/**
	 * Get cursor position
	 */
	getCursor(which?: 'from' | 'to'): EditorPosition;

	/**
	 * Set selection
	 */
	setSelection(from: EditorPosition, to: EditorPosition): void;

	/**
	 * Convert position to offset
	 */
	posToOffset(pos: EditorPosition): number;

	/**
	 * Convert offset to position
	 */
	offsetToPos(offset: number): EditorPosition;

	/**
	 * Whether the editor is currently in Live Preview mode
	 */
	isLivePreview(): boolean;
}

/**
 * Implementation of editor service using Obsidian Editor
 */
export class EditorService implements IEditorService {
	constructor(private readonly editor: Editor) {}

	getSelection(): string | null {
		return this.editor.getSelection();
	}

	replaceSelection(text: string): void {
		this.editor.replaceSelection(text);
	}

	replaceRange(text: string, from: EditorPosition, to: EditorPosition): void {
		this.editor.replaceRange(text, from, to);
	}

	getCursor(which?: 'from' | 'to'): EditorPosition {
		return this.editor.getCursor(which);
	}

	setSelection(from: EditorPosition, to: EditorPosition): void {
		this.editor.setSelection(from, to);
	}

	posToOffset(pos: EditorPosition): number {
		return this.editor.posToOffset(pos);
	}

	offsetToPos(offset: number): EditorPosition {
		return this.editor.offsetToPos(offset);
	}

	isLivePreview(): boolean {
		const anyEditor = this.editor as any;
		const editorView = (anyEditor?.cm ?? anyEditor?.editorView ?? anyEditor?.cm6) as
			| EditorView
			| undefined;
		if (!editorView || !(editorView as any).state) {
			return false;
		}

		try {
			return editorView.state.field(editorLivePreviewField) === true;
		} catch {
			return false;
		}
	}
}
