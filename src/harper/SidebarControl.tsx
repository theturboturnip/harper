import { ReactPortal, useCallback, useMemo, useRef } from 'react';
import useFrameCount from './useFrameCount';
import { createPortal } from 'react-dom';
import Highlighter from './Highlighter';
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
function extractFromNodeList< T extends Node >( list: NodeListOf< T > ): T[] {
	let elements: T[] = [];

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

	const closeHandlers = useRef( new Set< () => void >() );

	let requestClosePopups = useCallback( () => {
		closeHandlers.current.forEach( ( h ) => h() );
	}, [] );

	let highlights =
		documentContainer &&
		targetNodes.map( ( n ) => {
			return createPortal(
				<Highlighter
					container={ documentContainer }
					target={ n }
					requestClosePopups={ requestClosePopups }
					registerCloseHandler={ ( handler ) =>
						closeHandlers.current.add( handler )
					}
				/>,
				documentContainer
			);
		} );

	return (
		<>
			{ highlights }
			<p>This is a test.</p>
		</>
	);
}
