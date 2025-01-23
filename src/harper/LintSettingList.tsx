import React, { useEffect, useState } from 'react';
import { useLinter } from './HarperContext';
import LintSettingRow from './LintSettingRow';
import { LintConfig } from 'harper.js';

export default function LintSettingList() {
	const linter = useLinter();
	const [lintConfig, setLintConfig] = useState<LintConfig>({});
	const [defaultConfig, setDefaultConfig] = useState({});

	useEffect(() => {
		linter.getLintConfig().then((config) => setLintConfig(config));
		linter
			.getDefaultLintConfig()
			.then((config) => setDefaultConfig(config));
	}, [linter]);

	useEffect(() => {
		linter.setLintConfig(lintConfig);
	}, [lintConfig, linter]);

	return Object.entries(lintConfig).map(([key, value]) => (
		<LintSettingRow
			key={key}
			name={key}
			value={value}
			defaultValue={defaultConfig[key]}
			setValue={(newValue) =>
				setLintConfig({ ...lintConfig, [key]: newValue })
			}
		/>
	));
}
