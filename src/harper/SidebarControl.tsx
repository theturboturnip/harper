import DataBlock from './DataBlock';
import { ReactPortal, useCallback, useMemo, useRef } from 'react';
import useFrameCount from './useFrameCount';
import { getNodesFromQuerySelector, getRichTextContainers } from './domUtils';
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

	let blocks = DataBlock.getAllDataBlocks();

	let highlights =
		documentContainer &&
		blocks.map( ( block ) =>
			createPortal( <Highlighter block={ block } />, documentContainer )
		);

	return (
		<>
			{ highlights }
			<p>This is a test. Eventually, lints will show up here as well.</p>
		</>
	);
}
