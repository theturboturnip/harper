import { Lint, LocalLinter, Suggestion } from 'harper.js';
import {
	getNodesFromQuerySelector,
	getRangeForTextSpan,
	getRichTextContainers,
} from './domUtils';
import RichText from './RichText';
import { LintBox } from './Box';
import { setBlockContent } from './gutenbergUtils';
import { dispatch } from '@wordpress/data';

/** Represents a Gutenberg block on-screen.
 * So named because all of these blocks have a `data-block` attribute. */
export default class DataBlock {
	public readonly targetElement: Element;

	constructor( targetElement: Element ) {
		this.targetElement = targetElement;
	}

	private getClientId(): string {
		return this.targetElement.getAttribute( 'data-block' )!;
	}

	public getAllRichText(): RichText[] {
		let cont = getRichTextContainers( this.targetElement );

		return cont.map(
			( cont, index ) =>
				new RichText( cont, this, async ( newContent: string ) => {
					const { updateBlockAttributes } =
						dispatch( 'core/block-editor' );

					if ( cont == this.targetElement ) {
						await updateBlockAttributes( this.getClientId(), {
							content: newContent,
						} );
					} else {
						console.log( 'UNIMPLEMENTED' );
					}
				} )
		);
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

	public static getContainer(): Element {
		const iframe = document.querySelector( 'iframe[name="editor-canvas"]' );
		const iframeDocument =
			iframe?.contentDocument || iframe?.contentWindow.document;
		const container =
			iframeDocument?.body ||
			document.querySelector( '.edit-post-visual-editor > div' );
		return container;
	}
}
