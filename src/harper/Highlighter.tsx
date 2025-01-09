import { select, dispatch } from '@wordpress/data';
import React, { useCallback, useRef } from 'react';
import { useState, useEffect } from 'react';
import { LocalLinter, Lint, WorkerLinter, Suggestion, Span } from 'harper.js';
import SuggestionControl from './SuggestionControl';
import { LintBox } from './Box';
import {
	extractFromNodeList,
	flattenNodeChildren as leafNodes,
} from './domUtils';

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

function getRangeForTextSpan( target: Element, span: Span ): Range | null {
	let children = leafNodes( target );

	let range = document.createRange();
	let traversed = 0;

	let startFound = false;

	for ( let i = 0; i < children.length; i++ ) {
		let child = children[ i ];
		let childText = child.textContent;

		if ( traversed + childText.length > span.start && ! startFound ) {
			range.setStart( child, span.start - traversed );
			startFound = true;
		}

		if ( startFound && traversed + childText.length > span.end ) {
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
	target: Element,
	container: Element
): Promise< LintBox[] > {
	let text = target.textContent ?? '';
	// The ID of the node we're looking at
	let clientId = target.getAttribute( 'data-block' );

	let lints = await memoizedLint( text );

	let boxes: LintBox[] = [];

	for ( let lint of lints ) {
		let span = lint.span();
		let range = getRangeForTextSpan( target, span );

		if ( range == null ) {
			console.log( 'Could not locate range.' );
			continue;
		}

		let targetRect = range.getBoundingClientRect();
		let contRect = container.getBoundingClientRect();

		boxes.push( {
			x: targetRect.x - contRect.x,
			y: targetRect.y - contRect.y,
			width: targetRect.width,
			height: targetRect.height,
			lint,
			applySuggestion: async ( sug: Suggestion ) => {
				console.log( clientId );

				let fixed = await linter.applySuggestion( text, sug, span );

				console.log( fixed );

				const { selectBlock, updateBlockAttributes } =
					dispatch( 'core/block-editor' );

				selectBlock( clientId );
				updateBlockAttributes( clientId, { content: fixed } );
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
	target: Element;
	requestClosePopups: () => void;
	registerCloseHandler: ( handler: () => void ) => void;
} ) {
	const [ targetBoxes, setTargetBoxes ] = useState< LintBox[] >( [] );

	useEffect( () => {
		let running = true;

		function onFrame( _timestep: DOMHighResTimeStamp ) {
			computeLintBoxes( target, container ).then( setTargetBoxes );

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
					registerCloseHandler={ registerCloseHandler }
				/>
			) ) }
		</>
	);
}
