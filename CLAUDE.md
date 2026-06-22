# CLAUDE.md — ZEHN Hydrogen Frontend (session resume)

<!-- Read `.agile-v/STATE.md` at session start -->

## Quick start

1. `.agile-v/STATE.md` → stage / blockers
2. `.agile-v/REQUIREMENTS.md` → `REQ-XXXX` | `.agile-v/BACKLOG.md` → `BL-XXXX`
3. `AGENTS.md` — agent load order

## Last session — 2026-06-22

**Focus:** REQ-0003 hero CTA + copy | REQ-0004 nav | REQ-0008 filters

| Area | Summary |
|---|---|
| **Hero CTA** | `CtaShineButton` single-layer `.cta-shine-host`; `zehn-cta-styles.ts` (nav colors); white shine sweep, orange hover glow, ripple |
| **Hero text** | `hero-content.ts` phrases; `useTextCycle`; responsive wrap; `.hero-text-overlay*` in `app.css` |
| **Nav** | `header-nav-styles.ts`, `HeaderNavItem`, stagger motion, active state, glass panels |
| **Filters** | `MobileProductFilterDrawer`, `DesktopProductFilterRow`, `product-filter-ui.ts`, size label fix |
| **Tests** | `header-nav-active`, `scroll-lock`, `product-filters`, `nav-menu-phase`, `nav-stagger-motion` |

### Key files

```
app/lib/hero-content.ts          ← subtitle phrases
app/lib/zehn-cta-styles.ts       ← CTA nav color tokens
app/components/zehn/CtaShineButton.tsx
app/components/zehn/Hero.tsx
app/styles/app.css               ← cta-shine-host, hero-text-overlay
app/lib/header-nav-styles.ts
app/components/zehn/MobileProductFilterDrawer.tsx
```

### Header stack (frozen REQ-0004)

Mobile **102px** / desktop **106px** — sync: `site-header-stack.ts`, `AnnouncementBar`, `Header` top, `PageLayout` pt, `homepage-hero.css`

## Next

1. Visual sign-off: hero CTA + nav + filters @ 390 / 1280 / 1440 / 1920
2. Push `development` after commit
3. Optional: banner JPG padding below shoes (short viewport clip)

## Frozen

- REQ-0001 tokens — no change without approval
- REQ-0004 header stack — update all four sync points if heights change
- React Router 7 only (not Remix / not `react-router-dom`)

## Verify

```bash
npm run typecheck && npx vitest run
```

Log changes: `.agile-v/DECISION_LOG.md`, `.agile-v/BUILD_MANIFEST.md`
