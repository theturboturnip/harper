import React from 'react';
import { useState, useEffect } from 'react';
import { LocalLinter, Lint, WorkerLinter } from 'harper.js';

type Box = {
	/** Horizontal position in pixels */
	x: number;
	/** Vertical position in pixels */
	y: number;
	/** Width in pixels */
	width: number;
	/** Height in pixels */
	height: number;
};

type LintBox = Box & { lint: Lint }

let linter = new WorkerLinter();

let lints = new Map<string, Lint[]>();

async function memoizedLint(text: string): Promise<Lint[]>{
	if (lints.has(text)){
		return Promise.resolve(lints.get(text)!);
	}

	let newLints = await linter.lint(text);
	lints.set(text, newLints);

	return newLints;
}

/** Get target boxes for a text node.
 * Each box represents a Harper lint in the Node. */
async function getLintBoxesForNode( node: Node, container: Element ): Promise<LintBox[]> {
	let text = node.textContent ?? '';

	let lints = await memoizedLint(text);

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
			lint
		} );
	}

	return boxes;
}

export default function Highlight( {
	container,
	target,
}: {
	container: Element;
	target: Node;
} ) {
	const [ targetBoxes, setTargetBoxes ] = useState< Box[] >( [] );

	useEffect( () => {
		let running = true;

		function onFrame( _timestep: DOMHighResTimeStamp ) {
			//let contRect = container.getBoundingClientRect();

			getLintBoxesForNode( target, container ).then(setTargetBoxes)

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
			{ targetBoxes.map( ( { x, y, width, height } ) => (
				<div
					style={ {
						position: 'absolute',
						top: `${ y }px`,
						left: ` ${ x }px`,
						width: `${ width }px`,
						height: `${ height }px`,
						zIndex: -100,
						borderBottom: '3px solid red',
					} }
				></div>
			) ) }
		</>
	);
}
