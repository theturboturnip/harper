import { Span } from 'harper.js';

/** Turn a `NodeList` into a normal JavaScript array. */
export function extractFromHTMLCollection(
	collection: HTMLCollection
): Element[] {
	let elements: Element[] = [];

	for ( let el of collection ) {
		elements.push( el );
	}

	return elements;
}

/** Turn a `NodeList` into a normal JavaScript array. */
export function extractFromNodeList< T extends Node >(
	list: NodeListOf< T >
): T[] {
	let elements: T[] = [];

	for ( let i = 0; i < list.length; i++ ) {
		let item = list[ i ];
		elements.push( item );
	}

	return elements;
}

export function getNodesFromQuerySelector( element: Element, query: string ) {
	return extractFromNodeList( element.querySelectorAll( query ) );
}

/** Flatten a provided node, and it's children into a single array. */
export function leafNodes( node: Element ): Element[] {
	let out = [];

	let children = extractFromNodeList( node.childNodes );

	if ( children.length == 0 ) {
		return [ node ];
	}

	for ( let child of children ) {
		let sub = leafNodes( child );
		sub.forEach( ( v ) => out.push( v ) );
	}

	return out;
}

/** Given an element and a Span of text inside it, compute the Range that represents the region of the DOM represented. */
export function getRangeForTextSpan(
	target: Element,
	span: Span
): Range | null {
	let children = leafNodes( target );

	let range = document.createRange();
	let traversed = 0;

	let startFound = false;

	for ( let i = 0; i < children.length; i++ ) {
		let child = children[ i ] as HTMLElement;
		let childText = child.textContent;

		if ( traversed + childText.length > span.start && ! startFound ) {
			range.setStart( child, span.start - traversed );
			startFound = true;
		}

		if ( startFound && traversed + childText.length >= span.end ) {
			range.setEnd( child, span.end - traversed );
			return range;
		}

		traversed += childText?.length ?? 0;
	}

	return null;
}

/** Locate the rich text containers inside a given element.
 * Notice: this function may return the provided element. */
export function getRichTextContainers( target: Element ): Element[] {
	let elms: Element[] = [];

	if ( target.classList.contains( 'rich-text' ) ) {
		elms.push( target );
	}

	elms.push(
		...extractFromHTMLCollection(
			target.getElementsByClassName( 'rich-text' )
		)
	);

	return elms;
}
