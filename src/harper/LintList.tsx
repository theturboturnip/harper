import React from 'react';
import { LintBox } from './Box';
import LintListItem from './LintListItem';

export default function LintList({ lintBoxes }: { lintBoxes: LintBox[] }) {
	return (
		<>
			{lintBoxes
				.filter((box) => box.lint.suggestion_count() > 0)
				.map((box, index) => (
					<LintListItem key={index} box={box} />
				))}
		</>
	);
}
