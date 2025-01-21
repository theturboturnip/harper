import React, { useEffect, useMemo, useRef, useState } from 'react';
import { isPointInBox, LintBox } from './Box';
import { SuggestionKind } from 'harper.js';

function suggestionText(
	kind: SuggestionKind,
	problemText: string,
	replacementText: string
): string {
	if (kind === SuggestionKind.Remove) {
		return `Remove "${problemText}"`;
	} else if (kind === SuggestionKind.Replace) {
		return `Replace with “${replacementText}”`;
	}
	return `Insert "${replacementText}"`;
}

/**
 * A control for an individual suggestion shown on the screen.
 * This includes both the underline to be shown, and the control that appears when you hover over it.
 * @param root0
 * @param root0.lintBox
 */
export default function SuggestionControl({ lintBox }: { lintBox: LintBox }) {
	const { x, y, width, height, lint, applySuggestion } = lintBox;

	const underlineRef = useRef<HTMLDivElement | null>(null);
	const popoverRef = useRef<HTMLDivElement | null>(null);

	const suggestions = useMemo(() => lint.suggestions(), [lint]);
	const [showPopover, setShowPopover] = useState(false);

	useEffect(() => {
		const effectTarget = underlineRef.current;
		const popover = popoverRef.current;

		function mouseUp(e: MouseEvent) {
			if (effectTarget === null) {
				return;
			}

			const underlineRect = effectTarget.getBoundingClientRect();
			const popoverRect = popover?.getBoundingClientRect();

			if (
				isPointInBox([e.clientX, e.clientY], underlineRect) ||
				(popoverRect &&
					isPointInBox([e.clientX, e.clientY], popoverRect))
			) {
				setShowPopover(() => true);
			} else {
				setShowPopover(false);
			}
		}

		effectTarget?.parentElement?.addEventListener('mouseup', mouseUp);

		return () => {
			effectTarget?.parentElement?.removeEventListener(
				'mouseup',
				mouseUp
			);
		};

		// The lint is just plain _wrong_ here.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [underlineRef.current, popoverRef.current]);

	return (
		<>
			<div
				ref={underlineRef}
				className={`harper-underline-${lint.lint_kind()}`}
				style={{
					position: 'absolute',
					top: `${y}px`,
					left: ` ${x}px`,
					width: `${width}px`,
					height: `${height}px`,
				}}
			></div>
			{showPopover ? (
				<div
					ref={popoverRef}
					className="harper-popover"
					style={{
						position: 'absolute',
						top: `${y + height + 4}px`,
						left: ` ${x}px`,
						zIndex: 100,
					}}
				>
					<h1 className={`harper-underline-${lint.lint_kind()}`}>
						{lint.lint_kind()}
					</h1>

					<p>{lint.message()}</p>

					{suggestions.map((sug, index) => (
						<button
							key={index}
							onClick={() => applySuggestion(sug)}
						>
							{suggestionText(
								sug.kind(),
								lint.get_problem_text(),
								sug.get_replacement_text()
							)}
						</button>
					))}
				</div>
			) : (
				<></>
			)}
		</>
	);
}
