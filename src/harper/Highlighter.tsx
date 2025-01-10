import { setBlockContent } from './gutenbergUtils';
import React, { useCallback } from 'react';
import { useState, useEffect } from 'react';
import { Lint, WorkerLinter, Suggestion, Span } from 'harper.js';
import SuggestionControl from './SuggestionControl';
import { LintBox } from './Box';
import { getRangeForTextSpan } from './domUtils';

let linter = new WorkerLinter();

/** Given an element and the lint results for it, create bounding boxes that represent those errors on-screen.  */
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
	}, [ target ] );

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

	// Disable browser spellchecking in favor of ours
	useEffect( () => {
		target.spellcheck = false;

		return () => {
			target.spellcheck = true;
		};
	}, [ target ] );

	let visible = target.checkVisibility();

	return (
		<>
			{ visible &&
				targetBoxes.map( ( b ) => (
					<SuggestionControl lintBox={ b } />
				) ) }
		</>
	);
}
