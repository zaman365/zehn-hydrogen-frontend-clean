# Build Manifest — Cycle C1

<!-- Living document — map REQ → ART → files | Updated: 2026-06-20 -->

| ART-ID | Cycle | REQ | Type | Path | Status | Notes |
|---|---|---|---|---|---|---|
| ART-0002.5 | C1 | REQ-0003 | component | `app/components/zehn/Hero.tsx` | updated | hero-title-glow class; useTextCycle; Sparkles lucide icon left of CTA; fading class on subtitle |
| ART-0018.3 | C1 | REQ-0003 | lib | `app/lib/hero-text-shuffle.ts` | updated | useTextCycle — CSS crossfade (setTimeout fade), returns {displayed,fading}; useTextScramble alias kept |
| ART-0009.4 | C1 | REQ-0003 | styles | `app/styles/app.css` | updated | CTA gradient (indigo→orange); .hero-title-glow; subtitle glass pill + orange glow; zehn-cta-glow orange ring |
| ART-0002.4 | C1 | REQ-0003 | component | `app/components/zehn/Hero.tsx` | superseded | (see ART-0002.5) HeroTextOverlay: stagger entrance (key={activeSlide}), subtitle null-guard, ArrowRight icon |
| ART-0018.1 | C1 | REQ-0003 | lib | `app/lib/hero-text-shuffle.ts` | superseded | (see ART-0018.3) useTextScramble — RAF letter scramble, SSR-null guard, phrase cycling |
| ART-0018.2 | C1 | REQ-0003 | component | `app/components/zehn/CtaShineButton.tsx` | updated | White text, frosted glass rgba(255,255,255,0.13), arrow icon slot |
| ART-0002.3 | C1 | REQ-0003 | component | `app/components/zehn/Hero.tsx` | superseded | (see ART-0002.4) CSS-driven framing; object-position center 0%; comments synced 81/63px img_top |
| ART-0003.3 | C1 | REQ-0003 | route | `app/routes/_index.tsx` | implemented | `data-homepage-hero-fold` wrapper |
| ART-0004.2 | C1 | REQ-0003 | component | `app/components/zehn/ProductGrid.tsx` | implemented | Category chips below fold (no duplication) |
| ART-0009.3 | C1 | REQ-0003 | lib | `app/lib/site-header-stack.ts` | implemented | SITE_HEADER_STACK mobile 102 / desktop 106 |
| ART-0010.1 | C1 | REQ-0003 | styles | `app/styles/homepage-hero.css` | implemented | Width-based fold; offsets; edge gradient; max-height cap |
| ART-0009.2 | C1 | REQ-0003 | styles | `app/styles/app.css` | baseline | Imports homepage-hero.css; legacy laptop band may be superseded |
| ART-0006.1 | C1 | REQ-0004 | component | `app/components/zehn/Header.tsx` | modified | 3px floating gap: `top-[29px] sm:top-[32px]` |
| ART-0012.1 | C1 | REQ-0008 | component | `app/components/zehn/RippleButton.tsx` | implemented | Client ripple per RIPPLE_BUTTON_EFFECT.md |
| ART-0012.3 | C1 | REQ-0001 | lib | `app/lib/header-nav-styles.ts` | implemented | Nav tokens + pill text host (`HEADER_NAV_TEXT_HOST`, `cnHeaderNavTextHost`) |
| ART-0012.2 | C1 | REQ-0008 | component | `app/components/zehn/HeaderNavItem.tsx` | modified | HeaderNavLink uses pill host; mobile row hover zone |
| ART-0016.3 | C1 | REQ-0008 | component | `app/components/zehn/Header.tsx` | modified | categoryMenuPhase; staggerPhase; mobile shell delay; finishClose guard |
| ART-0017.1 | C1 | REQ-0008 | lib | `app/lib/nav-stagger-motion.ts` | implemented | Stagger delay/duration helpers + cnNavStaggerItem |
| ART-0017.2 | C1 | REQ-0008 | component | `app/components/zehn/ZehnNavStaggerItem.tsx` | implemented | Row wrapper with rAF enter + reduced motion |
| ART-0017.3 | C1 | REQ-0008 | hook | `app/hooks/usePrefersReducedMotion.ts` | implemented | OS reduced-motion media query |
| ART-0017.4 | C1 | REQ-0008 | test | `app/__tests__/nav-stagger-motion.test.ts` | implemented | Enter/exit delay + max duration |
| ART-0018.2 | C1 | REQ-0008 | test | `app/__tests__/nav-menu-phase.test.ts` | implemented | Phase helper matrix + mobile/desktop stagger |
| ART-0018.3 | C1 | REQ-0008 | component | `app/components/zehn/Header.tsx` | modified | freezeContent submenu; mobile surface stagger |
| ART-0019.1 | C1 | REQ-0008 | lib | `app/lib/scroll-lock.ts` | implemented | Ref-count scroll lock + data-zehn-scroll-lock |
| ART-0019.2 | C1 | REQ-0008 | hook | `app/hooks/useScrollLock.ts` | implemented | Overlay scroll lock hook |
| ART-0019.3 | C1 | REQ-0008 | styles | `app/styles/app.css` | modified | Lock-only scrollbar-gutter; `.zehn-scroll-edge` inner scroll |
| ART-0027.1 | C1 | REQ-0003 | lib | `app/lib/hero-content.ts` | implemented | HERO_SUBTITLE_PHRASES + HeroSubtitlePhrase type |
| ART-0027.2 | C1 | REQ-0003 | component | `app/components/zehn/CtaShineButton.tsx` | modified | Remove deprecated wrapClassName |
| ART-0027.3 | C1 | REQ-0003 | styles | `app/styles/app.css` | modified | .hero-text-overlay*; hero-title-glow comment |
| ART-0027.4 | C1 | REQ-0003 | component | `app/components/zehn/Hero.tsx` | modified | Import hero-content; overlay CSS classes |
| ART-0026.1 | C1 | REQ-0003 | lib | `app/lib/zehn-cta-styles.ts` | implemented | CTA text tokens from HEADER_NAV_COLOR |
| ART-0026.2 | C1 | REQ-0003 | component | `app/components/zehn/CtaShineButton.tsx` | modified | Nav color + semibold; zehn-cta-styles |
| ART-0026.3 | C1 | REQ-0003 | styles | `app/styles/app.css` | modified | Wrap hover lift; no underline; shine/ripple tune |
| ART-0026.4 | C1 | REQ-0003 | component | `app/components/zehn/Hero.tsx` | modified | Drop font-bold on ENTDECKEN CTA |
| ART-0025.1 | C1 | REQ-0008 | component | `app/components/zehn/MobileProductFilterDrawer.tsx` | implemented | Shared mobile facet drawer; scroll-lock; filter layout + icons |
| ART-0025.2 | C1 | REQ-0008 | lib | `app/lib/product-filter-ui.ts` | modified | buildColorFilterOptions; mobile drawer tokens |
| ART-0025.3 | C1 | REQ-0008 | route | `collections.$handle.tsx`, `collections.all.tsx`, `search.tsx`, `ProductGrid.tsx` | modified | Wire MobileProductFilterDrawer; remove inline drawers |
| ART-0025.4 | C1 | REQ-0003 | lib | `app/lib/hero-text-shuffle.ts` | modified | Remove useTextScramble deprecated alias |
| ART-0023.1 | C1 | REQ-0004 | lib | `app/lib/announcement-bar-content.ts` | implemented | Typed slides + Truck/Receipt/Sparkles icons |
| ART-0023.2 | C1 | REQ-0004 | component | `app/components/zehn/AnnouncementBar.tsx` | modified | Icon+text row; Lucide chevrons |
| ART-0022.2 | C1 | REQ-0008 | component | `app/components/CustomSelect.tsx` | modified | layout filter|default; centered 3-col trigger |
| ART-0022.3 | C1 | REQ-0008 | component | `app/components/zehn/DesktopProductFilterRow.tsx` | modified | layout=filter; removed Filter: label |
| ART-0022.4 | C1 | REQ-0008 | route | `collections.$handle.tsx`, `collections.all.tsx`, `search.tsx`, `ProductGrid.tsx` | modified | FILTER_BAR_SHELL parent |
| ART-0021.2 | C1 | REQ-0008 | component | `app/components/CustomSelect.tsx` | modified | Optional Lucide lead icon in trigger |
| ART-0021.3 | C1 | REQ-0008 | component | `app/components/zehn/FilterClearButton.tsx` | implemented | h-[40px] clear + RotateCcw + RippleButton |
| ART-0021.4 | C1 | REQ-0008 | component | `app/components/zehn/DesktopProductFilterRow.tsx` | implemented | Shared desktop Preis/Größe/Farbe row |
| ART-0021.5 | C1 | REQ-0008 | route | `collections.$handle.tsx`, `collections.all.tsx`, `search.tsx` | modified | Wire DesktopProductFilterRow |
| ART-0021.6 | C1 | REQ-0008 | component | `app/components/zehn/ProductGrid.tsx` | modified | Wire DesktopProductFilterRow |
| ART-0020.2 | C1 | REQ-0008 | component | `app/components/CustomSelect.tsx` | modified | Min/max list height + scroll-edge tokens |
| ART-0020.3 | C1 | REQ-0008 | component | `app/components/zehn/CartDrawer.tsx` | modified | RippleButton close/CTAs; scroll-edge on items list |
| ART-0020.4 | C1 | REQ-0008 | component | `app/components/zehn/SearchModal.tsx` | modified | ZEHN_SCROLL_EDGE on results pane |
| ART-0020.5 | C1 | REQ-0008 | component | `app/components/QuickAddModal.tsx` | modified | ZEHN_SCROLL_EDGE on modal body |
| ART-0019.1 | C1 | REQ-0008 | lib | `app/lib/scroll-lock.ts` | modified | Lock-only gutter JSDoc; debug removed |
| ART-0019.4 | C1 | REQ-0008 | test | `app/__tests__/scroll-lock.test.ts` | implemented | Ref-count acquire/release |
| ART-0018.1 | C1 | REQ-0008 | lib | `app/lib/nav-menu-phase.ts` | modified | NavMenuSurface; mobile closing → idle stagger |
| ART-0016.1 | C1 | REQ-0008 | lib | `app/lib/zehn-surface-styles.ts` | modified | ENTER_FROM; removed POSITIONER_CLOSED + POSITIONER_HIDDEN |
| ART-0016.2 | C1 | REQ-0008 | component | `app/components/zehn/ZehnGlassPanel.tsx` | modified | rAF enter slide-in; reduced-motion skip |
| ART-0015.1 | C1 | REQ-0008 | lib | `app/lib/zehn-surface-styles.ts` | modified | Dropdown positioner/scroll/bleed tokens; glow overflow JSDoc |
| ART-0015.2 | C1 | REQ-0008 | component | `app/components/zehn/ZehnGlassPanel.tsx` | implemented | Glow shell + inner scroll — safe shadow layering |
| ART-0015.3 | C1 | REQ-0008 | component | `app/components/zehn/Header.tsx` | modified | Desktop dropdown uses ZehnGlassPanel; overflow-visible open |
| ART-0014.1 | C1 | REQ-0008 | lib | `app/lib/header-nav-active.ts` | implemented | Exact/descendant active match; all↔shop-all; mobile open resolver |
| ART-0014.2 | C1 | REQ-0008 | component | `app/components/zehn/Header.tsx` | modified | Wire lib matchers; drawer auto-expand branch |
| ART-0014.3 | C1 | REQ-0008 | test | `app/__tests__/header-nav-active.test.ts` | implemented | Pathname matrix for nav active state |
| ART-0012.4 | C1 | REQ-0008 | component | `app/components/zehn/Header.tsx` | modified | Alle Produkte desktop nav; dropdown no heading; surface glow |
| ART-0013.1 | C1 | REQ-0008 | lib | `app/lib/zehn-surface-styles.ts` | implemented | Nav + dropdown glass shell + glow tokens |
| ART-0013.2 | C1 | REQ-0008 | component | `app/components/zehn/CtaShineButton.tsx` | implemented | Glass CTA ripple + CSS shine sweep |
| ART-0013.3 | C1 | REQ-0003 | component | `app/components/zehn/Hero.tsx` | modified | ENTDECKEN uses CtaShineButton |
| ART-0012.5 | C1 | REQ-0008 | styles | `app/styles/app.css` | modified | `.zehn-ripple`, `.cta-shine-wrap`, `.zehn-cta-glow` |
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
