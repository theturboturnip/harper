import { ReactPortal, useMemo } from 'react';
import useFrameCount from './useFrameCount';
import { createPortal } from 'react-dom';
import Highlight from './Highlight';
import React from 'react';

function getDocumentContainer(): Element | null {
	const iframe = document.querySelector( 'iframe[name="editor-canvas"]' );
	const iframeDocument =
		iframe?.contentDocument || iframe?.contentWindow.document;
	const container =
		iframeDocument?.body ||
		document.querySelector( '.edit-post-visual-editor > div' );
	return container;
}

/** Turn a NodeList into a normal JavaScript array. */
function extractFromNodeList( list: NodeList ): Node[] {
	let elements: Node[] = [];

	for ( let i = 0; i < list.length; i++ ) {
		let item = list[ i ];
		elements.push( item );
	}

	return elements;
}

function getNodesFromQuerySelector( element: Element, query: string ) {
	return extractFromNodeList( element.querySelectorAll( query ) );
}

export default function SidebarControl() {
	let frameCount = useFrameCount();

	let documentContainer = useMemo( getDocumentContainer, [] );

	let targetNodes = useMemo(
		() =>
			documentContainer
				? [
						...getNodesFromQuerySelector(
							documentContainer,
							'.wp-block-post-title'
						),
						...getNodesFromQuerySelector(
							documentContainer,
							'.wp-block-paragraph'
						),
				  ]
				: [],
		[ documentContainer, frameCount ]
	);

	let highlights = targetNodes.flatMap( ( n ) => {
		if ( ! documentContainer ) return [];

		let textChildren = extractFromNodeList( n.childNodes ).filter(
			( n ) => n.nodeType === 3
		);

		return textChildren.map( ( n ) =>
			createPortal(
				<Highlight container={ documentContainer } target={ n } />,
				documentContainer
			)
		);
	} );

	return (
		<>
			{ highlights }
			<p>This is a test.</p>
		</>
	);
}
