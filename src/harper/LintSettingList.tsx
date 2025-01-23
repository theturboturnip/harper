import React, { useEffect } from 'react';
import { useDefaultLintConfig, useLinterConfig } from './HarperContext';
import LintSettingRow from './LintSettingRow';

export default function LintSettingList() {
	const [lintConfig, setLintConfig] = useLinterConfig();
	const defaultConfig = useDefaultLintConfig();

	return Object.entries(lintConfig).map(([key, value]) => (
		<LintSettingRow
			key={key}
			name={key}
			value={value}
			defaultValue={defaultConfig[key]!}
			setValue={(newValue) =>
				setLintConfig({ ...lintConfig, [key]: newValue })
			}
		/>
	));
}
