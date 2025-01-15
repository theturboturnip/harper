import { setBlockContent } from './gutenbergUtils';
import React, { useCallback } from 'react';
import { useState, useEffect } from 'react';
import { Lint, WorkerLinter, Suggestion, Span } from 'harper.js';
import SuggestionControl from './SuggestionControl';
import { LintBox } from './Box';
import { getRangeForTextSpan } from './domUtils';
import DataBlock from './DataBlock';

let linter = new WorkerLinter();

export default function Highlighter( { block }: { block: DataBlock } ) {
	const [ targetBoxes, setTargetBoxes ] = useState< LintBox[] >( [] );
	const [ lints, setLints ] = useState< Lint[] >( [] );

	let updateLints = useCallback( () => {
		linter.lint( block.getTextContent() ).then( setLints );
	}, [ block ] );

	useEffect( () => {
		updateLints();
		let observer = new MutationObserver( updateLints );
		observer.observe( block.targetElement, {
			childList: true,
			characterData: true,
			subtree: true,
		} );

		return () => {
			observer.disconnect();
		};
	}, [ block ] );

	// Update the lint boxes each frame.
	// Probably overkill.
	//
	// TODO: revisit this to do more lazily.
	// Maybe `onLayoutEffect`?
	useEffect( () => {
		let running = true;

		function onFrame( _timestep: DOMHighResTimeStamp ) {
			let lintBoxes = lints
				.map( ( lint ) => block.computeLintBox( lint ) )
				.flat();
			setTargetBoxes( lintBoxes );

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
		block.targetElement.spellcheck = false;

		return () => {
			block.targetElement.spellcheck = true;
		};
	}, [ block ] );

	let visible = block.targetElement.checkVisibility();

	return (
		<>
			{ visible &&
				targetBoxes.map( ( b ) => (
					<SuggestionControl lintBox={ b } />
				) ) }
		</>
	);
}
