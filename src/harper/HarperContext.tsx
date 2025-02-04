import { Lint, LintConfig, Linter, WorkerLinter } from 'harper.js';
import React, {
	createContext,
	ReactNode,
	useContext,
	useEffect,
	useState,
} from 'react';

export type HarperConfig = {
	lintConfig: LintConfig;
	ignoredState?: string;
};

type HarperContextData = {
	linter: Linter;
	config: HarperConfig;
};

function createDefaultContextData(): HarperContextData {
	return {
		linter: new WorkerLinter(),
		config: {
			lintConfig: {},
		},
	};
}

const harperContext = createContext<
	[HarperContextData, React.Dispatch<HarperContextData>]
>([createDefaultContextData(), () => {}]);

export function HarperProvider({
	children,
}: {
	children: ReactNode | ReactNode[];
}) {
	const dataReadWrite = useState<HarperContextData>(() =>
		createDefaultContextData()
	);

	return (
		<harperContext.Provider value={dataReadWrite}>
			{children}
		</harperContext.Provider>
	);
}

export function useLinter(): Linter {
	const [data, setData] = useContext(harperContext);
	const [config] = useLinterConfig();
	const [ignoredLintState] = useIgnoredLintState();

	useEffect(() => {
		data.linter.setLintConfig(config);
	}, [config, data, setData]);

	useEffect(() => {
		(async () => {
			await data.linter.clearIgnoredLints();
			if (ignoredLintState !== undefined) {
				await data.linter.importIgnoredLints(ignoredLintState);
			}
		})();
	}, [ignoredLintState, data, setData]);

	return data.linter;
}

export function useLintDescriptions(): Record<string, string> {
	const [data] = useContext(harperContext);
	const [descriptions, setDescriptions] = useState({});

	useEffect(() => {
		data.linter.getLintDescriptions().then(setDescriptions);
	}, [data]);

	return descriptions;
}

export function useDefaultLintConfig(): LintConfig {
	const [data] = useContext(harperContext);
	const [defaultConfig, setDefaultConfig] = useState({});

	useEffect(() => {
		data.linter.getDefaultLintConfig().then(setDefaultConfig);
	}, [data]);

	return defaultConfig;
}

function useConfigKey<T>(key: string): [T, (newV: T) => void] {
	const [data, setData] = useContext(harperContext);

	return [
		data.config[key],
		(v) => setData({ ...data, config: { ...data.config, [key]: v } }),
	];
}

/**
 * Get the global linter's configuration, in addition to a callback to modify it.
 * This is the preferred method of modifying the lint configuration in this project, since this will trigger re-renders of
 * components that depend on the global linter.
 */
export function useLinterConfig(): [
	LintConfig,
	(newConfig: LintConfig) => void,
] {
	const [val, setVal] = useConfigKey('lintConfig');
	const defaultConfig = useDefaultLintConfig();

	useEffect(() => {
		if (Object.entries(val).length === 0) {
			setVal(defaultConfig);
		}
	}, [val, setVal, defaultConfig]);

	return [val as LintConfig, setVal];
}

export function useIgnoredLintState(): [
	string | undefined,
	(newState: string) => void,
] {
	const [val, setVal] = useConfigKey('ignoredState');

	return [val as string, setVal];
}

/** Grab a callback that can be used to ignore a lint. */
export function useIgnoreLint(): (lint: Lint) => Promise<void> {
	const linter = useLinter();
	const [_, setIgnoredLintState] = useIgnoredLintState();

	return async (lint) => {
		await linter.ignoreLint(lint);
		setIgnoredLintState(await linter.exportIgnoredLints());
	};
}
