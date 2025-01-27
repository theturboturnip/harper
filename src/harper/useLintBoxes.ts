import { useCallback, useEffect, useState } from 'react';
import { LintBox } from './Box';
import RichText from './RichText';
import { Lint } from 'harper.js';
import { useLinter, useLinterConfig } from './HarperContext';

/**
 * Lint given elements and return the resulting error targets.
 * Provides a loading state as well.
 * @param richTexts
 */
export default function useLintBoxes(
	richTexts: RichText[]
): [LintBox[][], boolean] {
	const linter = useLinter();
	const [config] = useLinterConfig();

	const [targetBoxes, setTargetBoxes] = useState<LintBox[][]>([]);
	const [lints, setLints] = useState<Lint[][]>([]);
	const [loading, setLoading] = useState(true);

	const updateLints = useCallback(async () => {
		// We assume that a given index always refers to the same rich text field.
		const newLints = await Promise.all(
			richTexts.map((richText) => {
				const contents = richText.getTextContent();
				return linter.lint(contents);
			})
		);

		setLoading(false);
		setLints(newLints);
	}, [richTexts, linter, config]);

	useEffect(() => {
		updateLints();

		const observers = richTexts.map((richText) => {
			const observer = new MutationObserver(updateLints);
			observer.observe(richText.getTargetElement(), {
				childList: true,
				characterData: true,
				subtree: true,
			});
			return observer;
		});

		return () => {
			observers.forEach((observer) => observer.disconnect());
		};
	}, [richTexts, updateLints]);

	// Update the lint boxes each frame.
	// Probably overkill.
	//
	// TODO: revisit this to do more lazily.
	// Maybe `onLayoutEffect`?
	useEffect(() => {
		let running = true;

		function onFrame() {
			const lintBoxes = lints.map((lintForText, index) => {
				const richText = richTexts[index];
				return lintForText.flatMap((lint) =>
					richText.computeLintBox(lint)
				);
			});

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

	return [targetBoxes, loading];
}
