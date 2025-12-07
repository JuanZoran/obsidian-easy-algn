import { AlignmentController } from './AlignmentController';
import type { AlignmentSettingsData } from '../../easyAlign/types';

/**
 * UI overlay for interactive alignment
 */
export class AlignmentOverlay {
	private container?: HTMLDivElement;
	private confirmButton?: HTMLButtonElement;
	private cancelButton?: HTMLButtonElement;
	private delimiterInput?: HTMLInputElement;
	private justifySelect?: HTMLSelectElement;

	constructor(
		private readonly lines: string[],
		private readonly controller: AlignmentController,
		private readonly onPreviewChange: (options: AlignmentSettingsData) => void,
		private readonly onConfirm: (options: AlignmentSettingsData) => void,
		private readonly onCancel: () => void,
	) {}

	open(): void {
		if (this.container) {
			return;
		}

		this.container = document.createElement('div');
		this.container.className = 'align-overlay';
		this.container.innerHTML = `
			<div class="align-overlay-body">
				<h4 class="align-overlay-title">Customize alignment</h4>
				<label>
					<span>Delimiter</span>
					<input name="delimiter" type="text" />
				</label>
				<label>
					<span>Justify mode</span>
					<select name="justify"></select>
				</label>
				<div class="align-overlay-actions">
					<button class="align-overlay-confirm mod-cta">Apply</button>
					<button class="align-overlay-cancel">Cancel</button>
				</div>
			</div>
		`;

		const delimiterInput = this.container.querySelector<HTMLInputElement>('input[name="delimiter"]');
		const justifySelect = this.container.querySelector<HTMLSelectElement>('select[name="justify"]');
		const confirmButton = this.container.querySelector<HTMLButtonElement>('.align-overlay-confirm');
		const cancelButton = this.container.querySelector<HTMLButtonElement>('.align-overlay-cancel');

		if (!delimiterInput || !justifySelect || !confirmButton || !cancelButton) {
			return;
		}

		this.delimiterInput = delimiterInput;
		this.justifySelect = justifySelect;
		this.confirmButton = confirmButton;
		this.cancelButton = cancelButton;

		const justifyOptions = ['left', 'center', 'right'] as const;
		justifyOptions.forEach((mode) => {
			const option = document.createElement('option');
			option.value = mode;
			option.textContent = mode[0].toUpperCase() + mode.slice(1);
			justifySelect.appendChild(option);
		});

		const state = this.controller.getCurrentState();
		delimiterInput.value = state.delimiter;
		justifySelect.value = Array.isArray(state.justify) ? state.justify[0] : state.justify;

		const applyCurrentState = () => {
			const currentState = this.controller.getCurrentState();
			this.onPreviewChange(currentState);
		};

		const handleInputChange = () => {
			this.controller.setDelimiter(delimiterInput.value);
			this.controller.setJustify(justifySelect.value as typeof justifyOptions[number]);
			applyCurrentState();
		};

		const handleCancel = () => {
			this.onCancel();
			this.close();
		};

		const handleSubmit = async () => {
			const result = await this.controller.submit();
			this.onPreviewChange(result);
			this.onConfirm(result);
			this.close();
		};

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Enter') {
				event.preventDefault();
				void handleSubmit();
				return;
			}
			if (event.key === 'Escape') {
				event.preventDefault();
				handleCancel();
			}
		};

		delimiterInput.addEventListener('input', handleInputChange);
		justifySelect.addEventListener('change', handleInputChange);
		this.container.addEventListener('keydown', handleKeyDown);

		confirmButton.addEventListener('click', () => {
			void handleSubmit();
		});

		cancelButton.addEventListener('click', handleCancel);

		document.body.appendChild(this.container);
		applyCurrentState();
		delimiterInput.focus();
	}

	close(): void {
		if (!this.container) {
			return;
		}
		this.container.remove();
		this.container = undefined;
		this.confirmButton = undefined;
		this.cancelButton = undefined;
		this.delimiterInput = undefined;
		this.justifySelect = undefined;
	}
}
