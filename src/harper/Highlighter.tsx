import React, { useCallback, useRef } from 'react';
import { useState, useEffect } from 'react';
import { LocalLinter, Lint, WorkerLinter, Suggestion } from 'harper.js';
import SuggestionControl from './SuggestionControl';
import { LintBox } from './Box';

let linter = new WorkerLinter();

let lints = new Map< string, Lint[] >();

async function memoizedLint( text: string ): Promise< Lint[] > {
	if ( lints.has( text ) ) {
		return Promise.resolve( lints.get( text )! );
	}

	let newLints = await linter.lint( text );
	lints.set( text, newLints );

	return newLints;
}

/** Get target boxes for a text node.
 * Each box represents a Harper lint in the Node. */
async function getLintBoxesForNode(
	node: Node,
	container: Element
): Promise< LintBox[] > {
	let text = node.textContent ?? '';

	let lints = await memoizedLint( text );

	let boxes: LintBox[] = [];

	for ( let lint of lints ) {
		let range = document.createRange();
		let span = lint.span();

		range.setStart( node, span.start );
		range.setEnd( node, span.end );

		let targetRect = range.getBoundingClientRect();
		let contRect = container.getBoundingClientRect();

		boxes.push( {
			x: targetRect.x - contRect.x,
			y: targetRect.y - contRect.y,
			width: targetRect.width,
			height: targetRect.height,
			lint,
			applySuggestion: async ( sug: Suggestion ) => {
				let fixed = await linter.applySuggestion( text, sug, span );
				node.textContent = fixed;
			},
		} );
	}

	return boxes;
}

export default function Highlighter( {
	container,
	target,
	requestClosePopups,
	registerCloseHandler,
}: {
	container: Element;
	target: Node;
	requestClosePopups: () => void;
	registerCloseHandler: ( handler: () => void ) => void;
} ) {
	const [ targetBoxes, setTargetBoxes ] = useState< LintBox[] >( [] );

	useEffect( () => {
		let running = true;

		function onFrame( _timestep: DOMHighResTimeStamp ) {
			//let contRect = container.getBoundingClientRect();

			getLintBoxesForNode( target, container ).then( setTargetBoxes );

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
				<SuggestionControl
					lintBox={ b }
					requestClosePopups={ requestClosePopups }
					registerCloseHandler={registerCloseHandler}
				/>
			) ) }
		</>
	);
}
