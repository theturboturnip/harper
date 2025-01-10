import { select, dispatch } from '@wordpress/data';
import React, { useCallback, useLayoutEffect, useRef } from 'react';
import { useState, useEffect } from 'react';
import { LocalLinter, Lint, WorkerLinter, Suggestion, Span } from 'harper.js';
import SuggestionControl from './SuggestionControl';
import { LintBox } from './Box';
import { leafNodes } from './domUtils';

let linter = new WorkerLinter();

function getRangeForTextSpan( target: HTMLElement, span: Span ): Range | null {
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

/** Get target boxes for a text node.
 * Each box represents a Harper lint in the Node. */
async function computeLintBoxes(
	target: HTMLElement,
	container: Element,
	lints: Lint[]
): Promise< LintBox[] > {
	// The ID of the node we're looking at
	let clientId = target.getAttribute( 'data-block' );
	let text = target.textContent;

	let boxes: LintBox[] = [];

	for ( let lint of lints ) {
		let span = lint.span();
		let range = getRangeForTextSpan( target, span );

		if ( range == null ) {
			console.log( 'Could not locate range.' );
			continue;
		}

		let targetRects = range.getClientRects();
		let contRect = container.getBoundingClientRect();

		for ( let targetRect of targetRects ) {
			boxes.push( {
				x: targetRect.x - contRect.x,
				y: targetRect.y - contRect.y,
				width: targetRect.width,
				height: targetRect.height,
				lint,
				applySuggestion: async ( sug: Suggestion ) => {
					let fixed = await linter.applySuggestion( text, sug, span );

					setBlockContent( clientId, fixed );
				},
			} );
		}
	}

	return boxes;
}

function setBlockContent( clientId: string, text: string ) {
	const { selectBlock, updateBlockAttributes } =
		dispatch( 'core/block-editor' );

	selectBlock( clientId );
	updateBlockAttributes( clientId, { content: text } );
}

export default function Highlighter( {
	container,
	target,
}: {
	container: Element;
	target: HTMLElement;
} ) {
	const [ targetBoxes, setTargetBoxes ] = useState< LintBox[] >( [] );
	const [ lints, setLints ] = useState< Lint[] >( [] );

	let updateLints = useCallback( () => {
		let text = target.textContent;
		text && linter.lint( text ).then( setLints );
	}, [target] );

	useEffect( () => {
		updateLints();
		let observer = new MutationObserver( updateLints );
		observer.observe( target, {
			childList: true,
			characterData: true,
			subtree: true,
		} );

		return () => {
			observer.disconnect();
		};
	}, [ target ] );

	useEffect( () => {
		let running = true;

		function onFrame( _timestep: DOMHighResTimeStamp ) {
			computeLintBoxes( target, container, lints ).then( setTargetBoxes );

			if ( running ) {
				requestAnimationFrame( onFrame );
			}
		}

		requestAnimationFrame( onFrame );

		return () => {
			running = false;
		};
	} );

	return (
		<>
			{ targetBoxes.map( ( b ) => (
				<SuggestionControl lintBox={ b } />
			) ) }
		</>
	);
}
