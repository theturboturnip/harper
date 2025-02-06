import React, { useEffect } from 'react';
import LintSettingRow from './LintSettingRow';
import useLintConfig, { useDefaultLintConfig } from './useLintConfig';
import { useLintDescriptions } from './LinterProvider';

export default function LintSettingList() {
	const [lintConfig, setLintConfig] = useLintConfig();
	const defaultConfig = useDefaultLintConfig();
	const descriptions = useLintDescriptions();

	return (
		<div className="harper-lint-config-cont">
			{Object.entries(lintConfig).map(([key, value]) => (
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
			))}
		</div>
	);
}
