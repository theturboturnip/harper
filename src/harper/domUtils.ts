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
