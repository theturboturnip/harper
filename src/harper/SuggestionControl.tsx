import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import { LintBox } from './Box';
import { Suggestion, SuggestionKind } from 'harper.js';
import { MouseEventHandler } from 'react';
import useElementPosition from './useElementPosition';

function suggestionText(
	kind: SuggestionKind,
	problemText: string,
	replacementText: string
): string {
	if ( kind == SuggestionKind.Remove ) {
		return `Remove "${ problemText }"`;
	} else if ( kind == SuggestionKind.Replace ) {
		return `Replace "${ problemText }" with "${ replacementText }"`;
	} else {
		return `Insert "${ replacementText }" after ${ problemText }`;
	}
}

/** A control for an individual suggestion shown on the screen. */
export default function SuggestionControl( { lintBox }: { lintBox: LintBox } ) {
	let { x, y, width, height, lint, applySuggestion } = lintBox;

	let underlineRef = useRef< HTMLElement | null >( null );
	let [ offsetX, offsetY ] = useElementPosition( underlineRef );

	let suggestions = useMemo( () => lint.suggestions(), [ lint ] );
	const [ showSuggestions, setShowSuggestions ] = useState( false );

	useEffect( () => {
		function mouseMove( e: MouseEvent ) {
			if (
				e.pageX > offsetX &&
				e.pageX < offsetX + width &&
				e.pageY > offsetY &&
				e.pageY < offsetY + height
			) {
				setShowSuggestions( true );
			}
		}

		function mouseUp( e: MouseEvent ) {
			if (
				e.pageX < offsetX &&
				e.pageX > offsetX + width &&
				e.pageY < offsetY &&
				e.pageY > offsetY + height
			) {
				setShowSuggestions( false );
			}
		}

		underlineRef.current?.parentElement?.addEventListener(
			'mousemove',
			mouseMove
		);

		underlineRef.current?.parentElement?.addEventListener(
			'mouseup',
			mouseUp
		);

		return () => {
			underlineRef.current?.parentElement?.removeEventListener(
				'mousemove',
				mouseMove
			);

			underlineRef.current?.parentElement?.removeEventListener(
				'mouseup',
				mouseUp
			);
		};
	}, [ offsetX, offsetY ] );

	return (
		<>
			<div
				ref={ underlineRef }
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
			{ showSuggestions && (
				<div
					className="harper-popover"
					style={ {
						position: 'absolute',
						top: `${ y + height + 4 }px`,
						left: ` ${ x }px`,
						zIndex: 100,
					} }
				>
					{ lint.message() }

					{ suggestions.map( ( sug ) => (
						<button onClick={() => applySuggestion(sug) }>
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
