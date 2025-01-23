import React, { useCallback, useState, useEffect } from 'react';
import { Lint } from 'harper.js';
import SuggestionControl from './SuggestionControl';
import { LintBox } from './Box';
import RichText from './RichText';
import { useLinter, useLinterConfig } from './HarperContext';

export default function Highlighter({ richText }: { richText: RichText }) {
	const linter = useLinter();
	const [config] = useLinterConfig();

	const [targetBoxes, setTargetBoxes] = useState<LintBox[]>([]);
	const [lints, setLints] = useState<Lint[]>([]);

	const updateLints = useCallback(async () => {
		// We assume that a given index always refers to the same rich text field.
		const contents = richText.getTextContent();
		const newLints = await linter.lint(contents);
		setLints(newLints);
	}, [richText, linter, config]);

	useEffect(() => {
		updateLints();
		const observer = new MutationObserver(updateLints);
		observer.observe(richText.getTargetElement(), {
			childList: true,
			characterData: true,
			subtree: true,
		});

		return () => {
			observer.disconnect();
		};
	}, [richText, updateLints]);

	// Update the lint boxes each frame.
	// Probably overkill.
	//
	// TODO: revisit this to do more lazily.
	// Maybe `onLayoutEffect`?
	useEffect(() => {
		let running = true;

		function onFrame() {
			const lintBoxes = lints
				.map((lint) => richText.computeLintBox(lint))
				.flat();
			setTargetBoxes(lintBoxes);

			if (running) {
				requestAnimationFrame(onFrame);
			}
		}

		requestAnimationFrame(onFrame);

		return () => {
			running = false;
		};
	});

	// Disable browser spellchecking in favor of ours
	useEffect(() => {
		richText.getTargetElement().spellcheck = false;

		return () => {
			richText.getTargetElement().spellcheck = true;
		};
	}, [richText]);

	const visible = richText.getTargetElement().checkVisibility();

	return (
		<>
			{visible &&
				targetBoxes.map((b, index) => (
					<SuggestionControl lintBox={b} key={index} />
				))}
		</>
	);
}
