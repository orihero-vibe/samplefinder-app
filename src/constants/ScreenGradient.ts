/**
 * Main app background gradient — matches ScreenWrapper and modal backdrops.
 */
export const SCREEN_GRADIENT_COLORS = [
  '#6C0331',
  '#4B0350',
  '#2A0458',
  '#0F0556',
  '#000047',
  '#080860',
] as const;

/** Stops for `expo-linear-gradient` (must be a fixed-length tuple for typings). */
export const SCREEN_GRADIENT_LOCATIONS: readonly [number, number, number, number, number, number] = [
  0, 0.2, 0.45, 0.65, 0.85, 1,
];

export const SCREEN_GRADIENT_START = { x: 0, y: 1 };
export const SCREEN_GRADIENT_END = { x: 1, y: 0 };
