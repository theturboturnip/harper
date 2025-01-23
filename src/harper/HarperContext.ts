import { WorkerLinter } from 'harper.js';
import { createContext, useContext } from 'react';

const HarperContext = createContext(new WorkerLinter());

export default HarperContext;

export function useLinter() {
	return useContext(HarperContext);
}
