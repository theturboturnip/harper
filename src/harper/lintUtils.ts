import { SuggestionKind } from 'harper.js';

export function suggestionText(
	kind: SuggestionKind,
	problemText: string,
	replacementText: string
): string {
	if (kind === SuggestionKind.Remove) {
		return `Remove "${problemText}"`;
	} else if (kind === SuggestionKind.Replace) {
		return `Replace with “${replacementText}”`;
	}
	return `Insert "${replacementText}"`;
}
