import React, { useEffect, useMemo, useRef, useState } from 'react';
import { isPointInBox, LintBox } from './Box';
import { SuggestionKind } from 'harper.js';

function suggestionText(
	kind: SuggestionKind,
	problemText: string,
	replacementText: string
): string {
	if ( kind == SuggestionKind.Remove ) {
		return `Remove "${ problemText }"`;
	} else if ( kind == SuggestionKind.Replace ) {
		return `Replace with “${ replacementText }”`;
	} else {
		return `Insert "${ replacementText }"`;
	}
}

/** A control for an individual suggestion shown on the screen.
 * This includes both the underline to be shown, and the control that appears when you hover over it.
 * */
export default function SuggestionControl( { lintBox }: { lintBox: LintBox } ) {
	let { x, y, width, height, lint, applySuggestion } = lintBox;

	let underlineRef = useRef< HTMLElement | null >( null );
	let popoverRef = useRef< HTMLElement | null >( null );

	let suggestions = useMemo( () => lint.suggestions(), [ lint ] );
	const [ showPopover, setShowPopover ] = useState( false );

	useEffect( () => {
		function mouseUp( e: MouseEvent ) {
			if ( underlineRef.current == null ) {
				return;
			}

			let underlineRect = underlineRef.current.getBoundingClientRect();
			let popoverRect = popoverRef.current?.getBoundingClientRect();

			if (
				isPointInBox( [ e.clientX, e.clientY ], underlineRect ) ||
				( popoverRect &&
					isPointInBox( [ e.clientX, e.clientY ], popoverRect ) )
			) {
				setShowPopover( () => true );
			} else {
				setShowPopover( false );
			}
		}

		underlineRef.current?.parentElement?.addEventListener(
			'mouseup',
			mouseUp
		);

		return () => {
			underlineRef.current?.parentElement?.removeEventListener(
				'mouseup',
				mouseUp
			);
		};
	}, [ underlineRef.current, popoverRef.current ] );

	return (
		<>
			<div
				ref={ underlineRef }
				className={ `harper-underline-${ lint.lint_kind() }` }
				style={ {
					position: 'absolute',
					top: `${ y }px`,
					left: ` ${ x }px`,
					width: `${ width }px`,
					height: `${ height }px`,
					zIndex: -100,
				} }
			></div>
			{ showPopover && (
				<div
					ref={ popoverRef }
					className="harper-popover"
					style={ {
						position: 'absolute',
						top: `${ y + height + 4 }px`,
						left: ` ${ x }px`,
						zIndex: 100,
					} }
				>
					<h1 className={ `harper-underline-${ lint.lint_kind() }` }>
						{ lint.lint_kind() }
					</h1>

					<p>{ lint.message() }</p>

					{ suggestions.map( ( sug ) => (
						<button onClick={ () => applySuggestion( sug ) }>
							{ suggestionText(
								sug.kind(),
								lint.get_problem_text(),
								sug.get_replacement_text()
							) }
						</button>
					) ) }
				</div>
			) }
		</>
	);
}
