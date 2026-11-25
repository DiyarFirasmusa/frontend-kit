import i18n from '@/lib/i18n/i18n';

interface KnownMessage {
  pattern: RegExp;
  key: string;
  params: (match: RegExpMatchArray) => Record<string, string>;
}

// Backend messages (usually English-only) mapped to i18n keys so they show
// translated. Add an entry per stable backend message the new API returns.
const KNOWN_MESSAGES: KnownMessage[] = [
  {
    pattern: /^The request conflicts with existing data/i,
    key: 'common.errors.dataConflict',
    params: () => ({}),
  },
];

export function translateKnownMessage(message: string): string | undefined {
  for (const entry of KNOWN_MESSAGES) {
    const match = message.match(entry.pattern);
    if (match) {
      return i18n.t(entry.key, entry.params(match));
    }
  }
  return undefined;
}
