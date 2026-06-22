/**
 * Hero fold copy — subtitle phrases cycled client-side via useTextCycle (REQ-0003).
 * No server fetch or cache; SSR renders null until mount (hydration-safe).
 */
export const HERO_SUBTITLE_PHRASES = [
  'PREMIUM HERRENMODE · LANGLEBIG GEFERTIGT',
  'QUALITÄT, DIE MAN FÜHLT — STIL, DEN MAN SIEHT',
  'EXKLUSIV · ZEITLOS · SUBSTANZ',
  'DIE NEUE KOLLEKTION 2026',
  'BEQUEM · MODERN · NACHHALTIG',
] as const;

export type HeroSubtitlePhrase = (typeof HERO_SUBTITLE_PHRASES)[number];
