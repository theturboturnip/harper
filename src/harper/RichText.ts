import { Lint, LocalLinter, Suggestion } from 'harper.js';
import { LintBox } from './Box';
import DataBlock from './DataBlock';
import { getRangeForTextSpan } from './domUtils';
import { setBlockContent } from './gutenbergUtils';

export type EditContentCallback = ( newContent: string ) => void;

/** Represents a rich text element on-screen. */
export default class RichText {
	private targetElement: Element;
	private parent: DataBlock;
	private editContent: EditContentCallback;

	constructor(
		targetElement: Element,
		parent: DataBlock,
		editContent: EditContentCallback
	) {
		this.targetElement = targetElement;
		this.parent = parent;
		this.editContent = editContent;
	}

	public getTargetElement(): Element {
		return this.targetElement;
	}

	public getTextContent(): string {
		return this.targetElement.textContent ?? '';
	}

	public computeLintBox( lint: Lint ): LintBox[] {
		let container = DataBlock.getContainer();
		let text = this.targetElement.textContent;
		let span = lint.span();
		let range = getRangeForTextSpan( this.targetElement, span );
		let linter = new LocalLinter();

		if ( range == null || text == null ) {
			console.log( 'Could not locate range.' );
			return [];
		}

		let targetRects = range.getClientRects();
		let contRect = container.getBoundingClientRect();

		let boxes: LintBox[] = [];

		for ( let targetRect of targetRects ) {
			boxes.push( {
				x: targetRect.x - contRect.x,
				y: targetRect.y - contRect.y,
				width: targetRect.width,
				height: targetRect.height,
				lint,
				applySuggestion: async ( sug: Suggestion ) => {
					let fixed = await linter.applySuggestion( text, sug, span );

					this.editContent( fixed );
				},
			} );
		}

		return boxes;
	}
}
