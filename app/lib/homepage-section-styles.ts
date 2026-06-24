/**
 * Shared homepage band vertical rhythm (REQ-0007 / ART-0040 / ART-0048).
 * One-directional: sibling gaps via STACK_GAP; grid gap via GRID_TOP only.
 */
export const ZEHN_HOMEPAGE_SECTION_PY = 'py-4 lg:py-6' as const;

/** @deprecated BL-0016 — toolbar shell uses no vertical inset; STACK_GAP + GRID_TOP own rhythm */
export const ZEHN_HOMEPAGE_INSET_PY = 'py-2 lg:py-4' as const;

/** Row/column gap between filter controls. */
export const ZEHN_HOMEPAGE_ROW_GAP = 'gap-3 lg:gap-4' as const;

/** Vertical stack gap between band siblings (nav → filter) — sole gap above toolbar (BL-0016). */
export const ZEHN_HOMEPAGE_STACK_GAP = 'space-y-3 lg:space-y-4' as const;

/** Space above product grid — sole gap below filter band (BL-0016). */
export const ZEHN_HOMEPAGE_GRID_TOP = 'mt-4 lg:mt-6' as const;
