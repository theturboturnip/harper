import React, { useEffect, useState } from 'react';
import { useLinter } from './HarperContext';
import { Animate, CheckboxControl } from '@wordpress/components';

export default function LintSettingRow({
	name,
	value,
	defaultValue,
	setValue,
}: {
	name: string;
	value: boolean | undefined;
	defaultValue: boolean;
	setValue: (newValue: boolean | undefined) => void;
}) {
	const linter = useLinter();

	const [title, setTitle] = useState<string | null>(null);

	useEffect(() => {
		linter.toTitleCase(name.replace(/_/g, ' ')).then(setTitle);
	}, [linter, name]);

	return title ? (
		<Animate type={title === null ? undefined : 'slide-in'}>
			{({ className }) => (
				<div className={`${className} harper-lint-config-row`}>
					<h3>{title}</h3>

					<CheckboxControl
						onChange={(val) => setValue(val)}
						checked={value ?? defaultValue}
					></CheckboxControl>
				</div>
			)}
		</Animate>
	) : (
		<></>
	);
}
