/**
 * ZEHN Design System - Design Tokens
 * 
 * Centralized design tokens for the ZEHN brand.
 * Use these constants for programmatic color/typography access.
 */

// ============================================================================
// COLORS
// ============================================================================

export const ZehnColors = {
  // Brand Colors
  indigo: '#0F1426',      // Anodized Indigo - primary, dark mode background
  slate: '#8E97A4',       // Industrial Slate - secondary
  signal: '#FF5F1F',      // Safety Signal - accent
  platinum: '#F4F4F5',    // Platinum - light mode background
} as const;

export const SemanticColors = {
  light: {
    primary: ZehnColors.indigo,
    primaryForeground: ZehnColors.platinum,
    secondary: ZehnColors.slate,
    secondaryForeground: ZehnColors.platinum,
    accent: ZehnColors.signal,
    accentForeground: ZehnColors.platinum,
    background: ZehnColors.platinum,
    foreground: ZehnColors.indigo,
    card: '#ffffff',
    cardForeground: ZehnColors.indigo,
    muted: ZehnColors.slate,
    mutedForeground: ZehnColors.platinum,
    border: ZehnColors.slate,
  },
  dark: {
    primary: ZehnColors.platinum,
    primaryForeground: ZehnColors.indigo,
    secondary: ZehnColors.slate,
    secondaryForeground: ZehnColors.platinum,
    accent: ZehnColors.signal,
    accentForeground: ZehnColors.platinum,
    background: ZehnColors.indigo,
    foreground: ZehnColors.platinum,
    card: '#1a1f35',
    cardForeground: ZehnColors.platinum,
    muted: ZehnColors.slate,
    mutedForeground: ZehnColors.indigo,
    border: ZehnColors.slate,
  },
} as const;

// ============================================================================
// TYPOGRAPHY
// ============================================================================

export const FontFamilies = {
  /** Primary font for all text — headings use weight 700 */
  sans: '"Space Grotesk", system-ui, sans-serif',
  /** Body alias (kept for backward compatibility) */
  body: '"Space Grotesk", system-ui, sans-serif',
} as const;

export const FontSizes = {
  h1: {
    size: '52px',
    lineHeight: '60px',
    letterSpacing: '-0.03em',
    fontWeight: '700',
  },
  h2: {
    size: '38px',
    lineHeight: '46px',
    letterSpacing: '-0.02em',
    fontWeight: '700',
  },
  h3: {
    size: '30px',
    lineHeight: '38px',
    letterSpacing: '-0.01em',
    fontWeight: '700',
  },
  subheadline: {
    size: '22px',
    lineHeight: '30px',
    letterSpacing: '-0.01em',
    fontWeight: '500',
  },
  body: {
    size: '14px',
    lineHeight: '22px',
    letterSpacing: '0em',
    fontWeight: '400',
  },
  'body-lg': {
    size: '16px',
    lineHeight: '26px',
    letterSpacing: '0em',
    fontWeight: '400',
  },
} as const;

export const LetterSpacing = {
  tight4: '-0.04em',  // -4%
  tight2: '-0.02em',  // -2%
  normal: '0em',
} as const;

// ============================================================================
// SPACING & LAYOUT
// ============================================================================

export const Spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
} as const;

export const LayoutConstants = {
  asideWidth: '400px',
  headerHeight: '64px',
  gridItemWidth: '355px',
} as const;

// ============================================================================
// BREAKPOINTS
// ============================================================================

export const Breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get color value by theme
 */
export function getSemanticColor(
  colorKey: keyof typeof SemanticColors.light,
  theme: 'light' | 'dark' = 'light'
): string {
  return SemanticColors[theme][colorKey];
}

/**
 * Generate CSS custom property name
 */
export function cssVar(tokenName: string): string {
  return `var(--${tokenName})`;
}

/**
 * Get font style object for a heading level
 */
export function getFontStyle(level: keyof typeof FontSizes) {
  const style = FontSizes[level];
  return {
    fontSize: style.size,
    lineHeight: style.lineHeight,
    letterSpacing: style.letterSpacing,
    fontWeight: style.fontWeight,
  };
}

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type ZehnColorKey = keyof typeof ZehnColors;
export type SemanticColorKey = keyof typeof SemanticColors.light;
export type FontFamilyKey = keyof typeof FontFamilies;
export type FontSizeKey = keyof typeof FontSizes;
export type ThemeMode = 'light' | 'dark';

// ============================================================================
// TAILWIND CLASS BUILDERS
// ============================================================================

/**
 * Common button class patterns
 */
export const ButtonStyles = {
  primary: 'bg-accent text-accent-foreground hover:opacity-90 transition-opacity',
  secondary: 'bg-secondary text-secondary-foreground hover:opacity-90 transition-opacity',
  outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors',
  ghost: 'text-foreground hover:bg-muted/10 transition-colors',
} as const;

/**
 * Common card class patterns
 */
export const CardStyles = {
  default: 'bg-card border border-border rounded-lg',
  interactive: 'bg-card border border-border rounded-lg hover:shadow-lg transition-shadow',
  elevated: 'bg-card border border-border rounded-lg shadow-md',
} as const;

/**
 * Typography class helpers
 */
export const TypographyClasses = {
  h1: 'font-sans text-h1',
  h2: 'font-sans text-h2',
  h3: 'font-sans text-h3',
  subheadline: 'font-sans text-subheadline',
  body: 'font-sans text-body',
  'body-lg': 'font-sans text-body-lg',
} as const;
