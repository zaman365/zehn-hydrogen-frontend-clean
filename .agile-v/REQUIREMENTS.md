# Requirements — ZEHN Hydrogen Frontend

<!-- Revision: C1 | Updated: 2026-06-20 | Bootstrap sync -->

## Index

| REQ | Title | Status | Priority |
|---|---|---|---|
| REQ-0001 | Brand tokens & typography preservation | `approved [C1]` | CRITICAL |
| REQ-0002 | React Router 7 routing conventions | `approved [C1]` | HIGH |
| REQ-0003 | Homepage hero banner framing | `modified [C1]` — **VERIFY** (code complete 2026-06-20) | HIGH |
| REQ-0004 | Fixed header stack (frozen) | `approved [C1]` | CRITICAL |
| REQ-0005 | Mobile-first responsive layout | `approved [C1]` | HIGH |
| REQ-0006 | Layout stability & performance (CLS/LCP) | `approved [C1]` | MEDIUM |
| REQ-0007 | Homepage section structure | `approved [C1]` | MEDIUM |
| REQ-0008 | Navigation, cart, search UX | `approved [C1]` | HIGH |
| REQ-0010 | German market tone & copy | `approved [C1]` | MEDIUM |
| REQ-0017 | Oxygen production deployment | `approved [C1]` | HIGH |
| REQ-0019 | Return Management System | `new [C1]` — out of scope UI phase | LOW |
| REQ-0020 | SEO tooling | `new [C1]` — backlog | LOW |

---

## REQ-0001: Brand tokens & typography preservation

| Field | Value |
|---|---|
| **Status** | `approved [C1]` |
| **Priority** | CRITICAL |
| **Area** | `app/lib/design-tokens.ts`, `app/styles/app.css`, `tailwind.config.js` |

Preserve client brand colors, typography scale, and premium aesthetic. Do not change design tokens without stakeholder approval.

**Verification:** Visual review; typography vitest in `app/__tests__/`.

---

## REQ-0002: React Router 7 routing conventions

| Field | Value |
|---|---|
| **Status** | `approved [C1]` |
| **Priority** | HIGH |
| **Area** | All routes, imports |

Use `react-router` packages — never `@remix-run/*` or `react-router-dom` in app code. See `.cursor/rules/hydrogen-react-router.mdc`.

**Verification:** ESLint / code review; no Remix imports in `app/`.

---

## REQ-0003: Homepage hero banner framing

| Field | Value |
|---|---|
| **Status** | `modified [C1]` — **VERIFY** (code complete 2026-06-20) |
| **Priority** | HIGH |
| **Area** | `Hero.tsx`, `homepage-hero.css`, `_index.tsx` fold, `site-header-stack.ts`, `ProductGrid.tsx` |
| **Backlog** | BL-0003 |

### User story

As a shopper, I want the homepage hero banner to frame models consistently across desktop and mobile, so that faces are not hidden behind the navbar and feet are not cut off above the category row.

### Acceptance criteria

1. No white/light gap between navbar bottom and hero studio background. — **implemented** (bg + gradient)
2. Model heads visible below the frosted nav pill on slides 1–3. — **implemented** (offset geometry)
3. Shoes/feet visible above the SHORTS / HOSEN / JEANS / JACKEN / TOPS row. — **implemented** at normal viewports; edge case on atypical short/wide windows
4. Consistent framing on large monitor (~1440px) and 14" laptop (~1280×800). — **implemented** (width-based formula)
5. Category chip row lives in **ProductGrid below the hero fold** — **implemented**

### Implementation notes (2026-06-20)

- Primary CSS: `app/styles/homepage-hero.css` — fold height from banner aspect ratio + img_top; offsets; edge gradient; max-height cap.
- Header stack: 102px mobile / 106px desktop (includes 3px navbar floating gap).
- Short-viewport shoe clip: accepted; recommend client extend banner JPGs with studio padding below shoes.
- See DECISION_LOG 2026-06-20, BUILD_MANIFEST ART-0002.3–0010.1, `CLAUDE.md`.

**Verification:** Manual 390 / 1280 / 1440 / 1920px; all 3 slides; `npm run typecheck`.

---

## REQ-0004: Fixed header stack (frozen)

| Field | Value |
|---|---|
| **Status** | `approved [C1]` |
| **Priority** | CRITICAL |
| **Area** | `AnnouncementBar.tsx`, `Header.tsx`, `PageLayout.tsx` |

| Layer | Values |
|---|---|
| Announcement | `h-[26px] sm:h-[29px]` |
| Floating gap | 3px (hero bg visible between bar and nav pill) |
| Header | `fixed top-[29px] sm:top-[32px]`, nav pill `h-[68px]` |
| Main offset | `pt-[102px] sm:pt-[106px]` |
| Stack constants | `SITE_HEADER_STACK` mobile 102 / desktop 106 |

Modified 2026-06-20: +3px floating gap with coordinated stack update. Do not change one file in isolation.

---

## REQ-0005: Mobile-first responsive layout

| Field | Value |
|---|---|
| **Status** | `approved [C1]` |
| **Priority** | HIGH |
| **Area** | `app/components/zehn/*`, routes |

All UI changes validated at 390px width minimum. Client proposal priority #1.

---

## REQ-0006: Layout stability & performance

| Field | Value |
|---|---|
| **Status** | `approved [C1]` |
| **Priority** | MEDIUM |
| **Area** | Images, navigation, SSR |

Reduce layout shift and flicker; hero LCP uses `fetchPriority="high"` on first slide.

---

## REQ-0007: Homepage section structure

| Field | Value |
|---|---|
| **Status** | `approved [C1]` |
| **Priority** | MEDIUM |
| **Area** | `app/routes/_index.tsx`, zehn components |

Hero → category nav (fold) → ProductGrid / sliders → FeaturedBento → Testimonials → ContactBar. See `Docs/HOMEPAGE_LAYOUT.md`.

---

## REQ-0008: Navigation, cart, search UX

| Field | Value |
|---|---|
| **Status** | `approved [C1]` |
| **Priority** | HIGH |
| **Area** | `Header.tsx`, `PageLayout.tsx`, asides |

Customer-friendly nav, cart drawer, search modal — preserve existing patterns when fixing bugs.

---

## REQ-0010: German market tone & copy

| Field | Value |
|---|---|
| **Status** | `approved [C1]` |
| **Priority** | MEDIUM |
| **Area** | Static pages, UI strings |

German copy for DE market; formal-friendly tone on legal and service pages.

---

## REQ-0017: Oxygen production deployment

| Field | Value |
|---|---|
| **Status** | `approved [C1]` |
| **Priority** | HIGH |
| **Area** | `.github/workflows/`, Hydrogen deploy |

CI deploy to Shopify Oxygen → zehnfashion.de. No deploy without stakeholder approval (Gate 2).

---

## REQ-0019: Return Management System

| Field | Value |
|---|---|
| **Status** | `new [C1]` — **out of scope** (UI phase) |
| **Priority** | LOW |
| **Area** | `.full-stack-feature/` |

Future backend/RMS work — not active in C1 UI polish stream.

---

## REQ-0020: SEO tooling

| Field | Value |
|---|---|
| **Status** | `new [C1]` — backlog |
| **Priority** | LOW |
| **Area** | TBD |

Deferred per PROJECT_WALKTHROUGH §15.
