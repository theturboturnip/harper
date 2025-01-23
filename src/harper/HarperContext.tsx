import { LintConfig, Linter, WorkerLinter } from 'harper.js';
import React, {
	createContext,
	ReactNode,
	useContext,
	useEffect,
	useState,
} from 'react';

type HarperContextData = {
	linter: Linter;
	config: LintConfig;
};

function createDefaultContextData(): HarperContextData {
	return {
		linter: new WorkerLinter(),
		config: {},
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
	const dataReadWrite = useState<HarperContextData>(
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

	useEffect(() => {
		data.linter.setLintConfig(config);
	}, [config, data, setData]);

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

/**
 * Get the global linter's configuration, in addition to a callback to modify it.
 * This is the preferred method of modifying the lint configuration in this project, since this will trigger re-renders of
 * components that depend on the global linter.
 */
export function useLinterConfig(): [
	LintConfig,
	(newConfig: LintConfig) => void,
] {
	const [data, setData] = useContext(harperContext);

	useEffect(() => {
		(async () => {
			const config = await data.linter.getLintConfig();
			const newData = { linter: data.linter, config };
			setData(newData);
		})();
	}, [data.linter, setData]);

	return [data.config, (config) => setData({ ...data, config })];
}
