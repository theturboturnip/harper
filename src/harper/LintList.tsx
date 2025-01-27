import React from 'react';
import { LintBox } from './Box';
import LintListItem from './LintListItem';
import { Animate } from '@wordpress/components';

export default function LintList({ lintBoxes }: { lintBoxes: LintBox[] }) {
	if (lintBoxes.length === 0) {
		return (
			<div className="harper-solved-cont">
				<Animate type="slide-in">
					{({ className }) => (
						<div className={className ?? ''}>
							<h2>LGTM 👍</h2>
							<p>
								Harper could not find any problems with your
								work.
							</p>
						</div>
					)}
				</Animate>
			</div>
		);
	}

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
