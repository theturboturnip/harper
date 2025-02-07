import { useDispatch, useSelect } from '@wordpress/data';
import { LintConfig } from 'harper.js';
import { useLinter } from './LinterProvider';
import { useCallback, useEffect, useMemo, useState } from 'react';

const KEY = 'lintConfig';

export default function useLintConfig(): [
	LintConfig,
	(newState: LintConfig) => void,
] {
	const defaultConfig = useDefaultLintConfig();
	const lintConfig = useSelect(
		(select) => select('core/preferences').get('harper-wp', KEY),
		[]
	);

	const { set } = useDispatch('core/preferences');

	const setConfig = useCallback((newValue) => {
		set('harper-wp', KEY, newValue);
	}, []);

	useEffect(() => {
		if (lintConfig == null) {
			setConfig(defaultConfig);
		}
	}, [defaultConfig, setConfig]);

	const nonNull = useMemo(() => {
		if (lintConfig == null) {
			return {};
		}
		return lintConfig;
	}, [lintConfig]);

	return [nonNull, setConfig];
}

export function useDefaultLintConfig(): LintConfig {
	const linter = useLinter();
	const [defaultConfig, setDefaultConfig] = useState({});

	useEffect(() => {
		linter.getDefaultLintConfig().then(setDefaultConfig);
	}, [linter]);

	return defaultConfig;
}
