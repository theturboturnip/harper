import React, { useEffect } from 'react';
import {
	useDefaultLintConfig,
	useLintDescriptions,
	useLinterConfig,
} from './HarperContext';
import LintSettingRow from './LintSettingRow';

export default function LintSettingList() {
	const [lintConfig, setLintConfig] = useLinterConfig();
	const defaultConfig = useDefaultLintConfig();
	const descriptions = useLintDescriptions();

	return Object.entries(lintConfig).map(([key, value]) => (
		<LintSettingRow
			key={key}
			name={key}
			description={descriptions[key]}
			value={value}
			defaultValue={defaultConfig[key]!}
			setValue={(newValue) =>
				setLintConfig({ ...lintConfig, [key]: newValue })
			}
		/>
	));
}
