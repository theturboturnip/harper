import { WorkerLinter } from 'harper.js';
import { createContext } from 'react';

export default createContext(new WorkerLinter());
