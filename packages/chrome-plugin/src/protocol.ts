import type { Dialect, LintConfig, Summary } from 'harper.js';
import type { UnpackedLint, UnpackedSuggestion } from './unpackLint';

export type Request =
	| LintRequest
	| GetConfigRequest
	| SetConfigRequest
	| GetLintDescriptionsRequest
	| SetDialectRequest
	| GetDialectRequest
	| SetDomainStatusRequest
	| SetDefaultStatusRequest
	| GetDomainStatusRequest
	| GetDefaultStatusRequest
	| AddToUserDictionaryRequest
	| SetUserDictionaryRequest
	| IgnoreLintRequest
	| GetUserDictionaryRequest;

export type Response =
	| LintResponse
	| GetConfigResponse
	| UnitResponse
	| GetLintDescriptionsResponse
	| GetDialectResponse
	| GetDomainStatusResponse
	| GetDefaultStatusResponse
	| GetUserDictionaryResponse;

export type LintRequest = {
	kind: 'lint';
	domain: string;
	text: string;
};

export type LintResponse = {
	kind: 'lints';
	lints: UnpackedLint[];
};

export type GetConfigRequest = {
	kind: 'getConfig';
};

export type GetConfigResponse = {
	kind: 'getConfig';
	config: LintConfig;
};

export type SetConfigRequest = {
	kind: 'setConfig';
	config: LintConfig;
};

export type SetDialectRequest = {
	kind: 'setDialect';
	dialect: Dialect;
};

export type GetLintDescriptionsRequest = {
	kind: 'getLintDescriptions';
};

export type GetLintDescriptionsResponse = {
	kind: 'getLintDescriptions';
	descriptions: Record<string, string>;
};

export type GetDialectRequest = {
	kind: 'getDialect';
};

export type GetDialectResponse = {
	kind: 'getDialect';
	dialect: Dialect;
};

export type GetDomainStatusRequest = {
	kind: 'getDomainStatus';
	domain: string;
};

export type GetDomainStatusResponse = {
	kind: 'getDomainStatus';
	domain: string;
	enabled: boolean;
};

export type GetDefaultStatusRequest = {
	kind: 'getDefaultStatus';
};

export type GetDefaultStatusResponse = {
	kind: 'getDefaultStatus';
	enabled: boolean;
};

export type SetDomainStatusRequest = {
	kind: 'setDomainStatus';
	domain: string;
	enabled: boolean;
};

export type SetDefaultStatusRequest = {
	kind: 'setDefaultStatus';
	enabled: boolean;
};

export type AddToUserDictionaryRequest = {
	kind: 'addToUserDictionary';
	words: string[];
};

export type SetUserDictionaryRequest = {
	kind: 'setUserDictionary';
	words: string[];
};

export type GetUserDictionaryRequest = {
	kind: 'getUserDictionary';
};

export type GetUserDictionaryResponse = {
	kind: 'getUserDictionary';
	words: string[];
};

export type IgnoreLintRequest = {
	kind: 'ignoreLint';
	contextHash: string;
};

/** Similar to returning void. */
export type UnitResponse = {
	kind: 'unit';
};

export function createUnitResponse(): UnitResponse {
	return { kind: 'unit' };
}
