# Build Manifest — Cycle C1

<!-- Living document — map REQ → ART → files | Updated: 2026-06-20 -->

| ART-ID | Cycle | REQ | Type | Path | Status | Notes |
|---|---|---|---|---|---|---|
| ART-0002.3 | C1 | REQ-0003 | component | `app/components/zehn/Hero.tsx` | implemented | CSS-driven framing; object-position center 0%; comments synced 81/63px img_top |
| ART-0003.3 | C1 | REQ-0003 | route | `app/routes/_index.tsx` | implemented | `data-homepage-hero-fold` wrapper |
| ART-0004.2 | C1 | REQ-0003 | component | `app/components/zehn/ProductGrid.tsx` | implemented | Category chips below fold (no duplication) |
| ART-0009.3 | C1 | REQ-0003 | lib | `app/lib/site-header-stack.ts` | implemented | SITE_HEADER_STACK mobile 102 / desktop 106 |
| ART-0010.1 | C1 | REQ-0003 | styles | `app/styles/homepage-hero.css` | implemented | Width-based fold; offsets; edge gradient; max-height cap |
| ART-0009.2 | C1 | REQ-0003 | styles | `app/styles/app.css` | baseline | Imports homepage-hero.css; legacy laptop band may be superseded |
| ART-0006.1 | C1 | REQ-0004 | component | `app/components/zehn/Header.tsx` | modified | 3px floating gap: `top-[29px] sm:top-[32px]` |
| ART-0007.0 | C1 | REQ-0004 | component | `app/components/zehn/AnnouncementBar.tsx` | frozen | h-[26px] sm:h-[29px] unchanged |
| ART-0008.1 | C1 | REQ-0004 | layout | `app/components/PageLayout.tsx` | modified | main `pt-[102px] sm:pt-[106px]` |
| ART-0005.0 | C1 | REQ-0007 | route | `app/routes/_index.tsx` | baseline | Homepage loader + sections |
| ART-0011.0 | C1 | — | docs | `CLAUDE.md` | added | Session resume for Claude |

## Removed / deprecated

| ART-ID | Path | Notes |
|---|---|---|
| ART-0002.2 | Hero.tsx (prior) | desktopShiftPx / debug logs removed |
| — | `HomepageCategoryNav.tsx` | Deleted earlier; category nav in ProductGrid only |

## Pending

| Item | Blocked by |
|---|---|
| REQ-0003 formal acceptance | Stakeholder visual TC-0005 at 390 / 1280 / 1440 / 1920 |
| Banner JPG bottom padding | Client asset production (optional) |

## Change protocol

On any code change: add or bump ART row (`.N` suffix), link REQ, append DECISION_LOG entry.
