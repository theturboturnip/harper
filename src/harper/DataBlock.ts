import { Lint, LocalLinter, Suggestion } from 'harper.js';
import {
	getNodesFromQuerySelector,
	getRangeForTextSpan,
	getRichTextContainers,
} from './domUtils';
import { LintBox } from './Box';
import { setBlockContent } from './gutenbergUtils';

/** Represents a Gutenberg block on-screen.
 * So named because all of these blocks have a `data-block` attribute. */
export default class DataBlock {
	public targetElement: Element;

	constructor( targetElement: Element ) {
		this.targetElement = targetElement;
	}

	public static getAllDataBlocks(): DataBlock[] {
		let container = this.getContainer();

		let targetNodes = [
			...getNodesFromQuerySelector( container, '[data-block].rich-text' ),
			...getNodesFromQuerySelector(
				container,
				'[data-block].wp-block-list'
			),
		];

		return targetNodes.map( ( node ) => new DataBlock( node ) );
	}

	public getTextContent(): string {
		return this.targetElement.textContent!;
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

					console.log( 'Applying suggestion' );

					setBlockContent( this.getClientId(), fixed );
				},
			} );
		}

		return boxes;
	}

	private getClientId(): string {
		return this.targetElement.getAttribute( 'data-block' )!;
	}

	private static getContainer(): Element {
		const iframe = document.querySelector( 'iframe[name="editor-canvas"]' );
		const iframeDocument =
			iframe?.contentDocument || iframe?.contentWindow.document;
		const container =
			iframeDocument?.body ||
			document.querySelector( '.edit-post-visual-editor > div' );
		return container;
	}
}
