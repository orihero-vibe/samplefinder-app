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

/**
 * When to show the in-app trivia modal.
 * - Production: Tuesdays (Eastern), same as the Trivia Tuesday campaign.
 * - Development: every day so QA can reproduce and fix issues.
 * - Optional: set EXPO_PUBLIC_TRIVIA_DAILY=true (e.g. staging) for daily trivia.
 */
export function isTriviaOfferedToday(now: Date = new Date()): boolean {
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    return true;
  }
  if (process.env.EXPO_PUBLIC_TRIVIA_DAILY === 'true') {
    return true;
  }
  return isTriviaTuesdayEastern(now);
}
