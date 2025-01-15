import { setBlockContent } from './gutenbergUtils';
import React, { useCallback } from 'react';
import { useState, useEffect } from 'react';
import { Lint, WorkerLinter, Suggestion, Span } from 'harper.js';
import SuggestionControl from './SuggestionControl';
import { LintBox } from './Box';
import DataBlock from './DataBlock';
import RichText from './RichText';

let linter = new WorkerLinter();

export default function Highlighter( { richText }: { richText: RichText } ) {
	const [ targetBoxes, setTargetBoxes ] = useState< LintBox[] >( [] );
	const [ lints, setLints ] = useState< Lint[] >( [] );

	let updateLints = useCallback( async () => {
		// We assume that a given index always refers to the same rich text field.
		let contents = richText.getTextContent();
		let lints = await linter.lint( contents );
		setLints( lints );
	}, [ richText ] );

	useEffect( () => {
		updateLints();
		let observer = new MutationObserver( updateLints );
		observer.observe( richText.getTargetElement(), {
			childList: true,
			characterData: true,
			subtree: true,
		} );

		return () => {
			observer.disconnect();
		};
	}, [ richText ] );

	// Update the lint boxes each frame.
	// Probably overkill.
	//
	// TODO: revisit this to do more lazily.
	// Maybe `onLayoutEffect`?
	useEffect( () => {
		let running = true;

		function onFrame( _timestep: DOMHighResTimeStamp ) {
			let lintBoxes = lints
				.map( ( lint ) => richText.computeLintBox( lint ) )
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
		richText.getTargetElement().spellcheck = false;

		return () => {
			richText.getTargetElement().spellcheck = true;
		};
	}, [ richText ] );

	let visible = richText.getTargetElement().checkVisibility();

	return (
		<>
			{ visible &&
				targetBoxes.map( ( b ) => (
					<SuggestionControl lintBox={ b } />
				) ) }
		</>
	);
}
