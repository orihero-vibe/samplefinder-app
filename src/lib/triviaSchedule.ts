/**
 * Trivia is only offered on Tuesday 00:00–23:59 America/New_York
 * (aligned with the Trivia Tuesday push campaign).
 */
const TRIVIA_TIMEZONE = 'America/New_York';

export function isTriviaTuesdayEastern(now: Date = new Date()): boolean {
  const weekday = new Intl.DateTimeFormat('en-US', {
    timeZone: TRIVIA_TIMEZONE,
    weekday: 'long',
  }).format(now);
  return weekday === 'Tuesday';
}
