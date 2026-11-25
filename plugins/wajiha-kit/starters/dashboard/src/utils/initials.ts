import type { MeResponse } from '@/types/api/me';

/** Two-letter avatar initials: first + last name when known, else the first two words of the display name. */
export function getInitials(
  person: Partial<
    Pick<MeResponse, 'firstName' | 'lastName' | 'displayName'>
  > | null,
): string {
  const first = person?.firstName?.trim();
  const last = person?.lastName?.trim();
  if (first && last) {
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  }
  const words = (person?.displayName ?? first ?? last ?? '')
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) {
    return '—';
  }
  const letters =
    words.length === 1
      ? Array.from(words[0] ?? '').slice(0, 2)
      : words.slice(0, 2).map((word) => word.charAt(0));
  return letters.join('').toUpperCase();
}
