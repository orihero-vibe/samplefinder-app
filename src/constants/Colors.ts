/**
 * Brand Colors
 * Colors extracted from design specifications
 */
export const Colors = {
  // Large gradient background colors
  brandPurpleDeep: '#4B1F56',
  brandBlueDeep: '#081756',
  brandBlueBright: '#090188',

  // Brighter gradient spot colors
  brandPurpleBright: '#910168',
  brandPurpleWine: '#6C0331',
  brandPurpleBrightAlt: '#3E0368',

  // Additional colors
  orangeBA: '#F16F30',
  pinkInfluencer: '#FF0066',
  badgePurpleLight: '#D95AFF',
  failure: '#F41616',
  success: '#96D31C',
  badgePurpleMed: '#9301C0',

  // Pin Colors
  pinDarkBlue: '#1E0E50',
  pinBlueBlack: '#050A24',

  // Color Mode
  blueColorMode: '#1D0A74',

  // Common UI colors
  white: '#FFFFFF',
  black: '#000000',
} as const;

export type ColorsType = typeof Colors;

