import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import { LintBox } from './Box';
import { SuggestionKind } from 'harper.js';

function suggestionText(
	kind: SuggestionKind,
	problemText: string,
	replacementText: string
): string {
	if ( kind == SuggestionKind.Remove ) {
		return `Remove "${ problemText }"`;
	} else if ( kind == SuggestionKind.Replace ) {
		return `Replace with "${ replacementText }"`;
	} else {
		return `Insert "${ replacementText }"`;
	}
}

/** A control for an individual suggestion shown on the screen.
 * This includes both the underline to be shown, and the control that appears when you hover over it.
 * */
export default function SuggestionControl( {
	lintBox,
	requestClosePopups,
	registerCloseHandler,
}: {
	lintBox: LintBox;
	requestClosePopups: () => void;
	registerCloseHandler: ( handler: () => void ) => void;
} ) {
	let { x, y, width, height, lint, applySuggestion } = lintBox;

	let underlineRef = useRef< HTMLElement | null >( null );

	let suggestions = useMemo( () => lint.suggestions(), [ lint ] );
	const [ showSuggestions, setShowSuggestions ] = useState( false );

	useEffect( () => {
		registerCloseHandler( () => setShowSuggestions( false ) );
	}, [] );

	useEffect( () => {
		function mouseMove( e: MouseEvent ) {
			if ( underlineRef.current == null ) {
				return;
			}

			let rect = underlineRef.current.getBoundingClientRect();

			if (
				e.clientX > rect.x &&
				e.clientX < rect.x + width &&
				e.clientY > rect.y &&
				e.clientY < rect.y + height
			) {
				requestClosePopups();
				setShowSuggestions( () => true );
			}
		}

		function mouseUp( e: MouseEvent ) {
			if ( e.target != this ) {
				return;
			}

			let offsetX = underlineRef.current?.offsetLeft ?? 0;
			let offsetY = underlineRef.current?.offsetLeft ?? 0;

			if (
				e.pageX < offsetX ||
				e.pageX > offsetX + width ||
				e.pageY < offsetY ||
				e.pageY > offsetY + height
			) {
				requestClosePopups();
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
	}, [ requestClosePopups, underlineRef.current ] );

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
