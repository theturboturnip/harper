import { Card, Button, CardBody } from '@wordpress/components';
import { LintBox } from './Box';
import React from 'react';
import { suggestionText } from './lintUtils';

export default function LintListItem({ box }: { box: LintBox }) {
	return (
		<Card size="small" className="harper-lint-card">
			<CardBody>
				<h2 className={`harper-underline-${box.lint.lint_kind()}`}>
					{box.lint.lint_kind_pretty()}
				</h2>
				<p>{box.lint.message()}</p>

				{box.lint.suggestions().map((sug, index) => (
					<Button
						variant="primary"
						key={index}
						onClick={() => box.applySuggestion(sug)}
					>
						{suggestionText(
							sug.kind(),
							box.lint.get_problem_text(),
							sug.get_replacement_text()
						)}
					</Button>
				))}
			</CardBody>
		</Card>
	);
}
