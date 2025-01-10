import { ReactPortal, useCallback, useMemo, useRef } from 'react';
import useFrameCount from './useFrameCount';
import { getNodesFromQuerySelector } from './domUtils';
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

export default function SidebarControl() {
	let frameCount = useFrameCount();

	let documentContainer = useMemo( getDocumentContainer, [] );

	let targetNodes = useMemo(
		() =>
			documentContainer
				? getNodesFromQuerySelector( documentContainer, '.rich-text' )
				: [],
		[ documentContainer, frameCount ]
	);

	let highlights =
		documentContainer &&
		targetNodes.map( ( n ) => {
			return createPortal(
				<Highlighter container={ documentContainer } target={ n } />,
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
