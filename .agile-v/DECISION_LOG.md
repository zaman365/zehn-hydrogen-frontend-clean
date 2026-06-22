# Decision Log (append-only)

<!-- Agile V — ZEHN Hydrogen Frontend -->

---

## 2026-06-22 | Cursor Agent | Cleanup | REQ-0003

**Decision:** Hero CTA consistency cleanup — dead API removal, shared overlay CSS, hero copy lib.

**Rationale:**

- Removed deprecated `wrapClassName` from `CtaShineButton` (single-layer `.cta-shine-host` since ART-0026).
- `.hero-text-overlay` / `--mobile` / `--desktop` in `app.css` replaces duplicated Tailwind layout.
- `hero-content.ts` centralizes `HERO_SUBTITLE_PHRASES` (client-only `useTextCycle`; no cache).
- Deleted `.playwright-mcp/` debug artifacts.

**Note:** Historical entries referencing `.cta-shine-wrap` superseded by `.cta-shine-host` on the link element.

**Artifacts:** `CtaShineButton.tsx`, `hero-content.ts`, `Hero.tsx`, `app.css`

---

## 2026-06-22 | Cursor Agent | UX | REQ-0003

**Decision:** Hero CTA shine polish — thicker sweep over label, inner edge vignette, hover orange glow.

**Rationale:** Shine pseudo-elements `z-index: 2` + `mix-blend-mode` so sweep reads on icon/text; 8.5s ease; radial inner gradient (subtle edge, not dark); stronger `.zehn-cta-glow:hover`; Sparkles 12/17px.

**Artifacts:** `app.css`, `Hero.tsx`, `zehn-cta-styles.ts`

---

## 2026-06-22 | Cursor Agent | UX | REQ-0003 / REQ-0008

**Decision:** Hero CTA nav color parity + unified hover lift on shine wrapper.

**Rationale:**

- `zehn-cta-styles.ts` reuses `HEADER_NAV_COLOR` — idle `foreground/70`, hover `text-accent`, no underline.
- Lift moved from `.cta-shine-button` to `.cta-shine-wrap` — pill + glow move together (fixes line seam).
- Shine 6s ease-in-out; stronger `.zehn-ripple` on light glass; `font-semibold` matches nav weight.

**Artifacts:** `zehn-cta-styles.ts`, `CtaShineButton.tsx`, `app.css`, `Hero.tsx`

---

## 2026-06-22 | Cursor Agent | UX | REQ-0008

**Decision:** Shared `MobileProductFilterDrawer` — desktop filter row parity on mobile.

**Rationale:**

- ~70 lines duplicated in 4 routes → single component with `layout="filter"`, icons, `buildSizeFilterOptions` / `buildColorFilterOptions`.
- `useScrollLock`, Escape close, `FilterClearButton` ripple, German **Anwenden** CTA.
- `product-filter-ui.ts` — mobile drawer shell tokens + `buildColorFilterOptions`.
- Removed deprecated `useTextScramble` alias; deleted `.playwright-mcp` debug artifacts.

**Artifacts:** `MobileProductFilterDrawer.tsx`, `product-filter-ui.ts`, `DesktopProductFilterRow.tsx`, `collections.$handle.tsx`, `collections.all.tsx`, `search.tsx`, `ProductGrid.tsx`, `hero-text-shuffle.ts`

---

## 2026-06-22 | Claude | UX | REQ-0003 — Hero CTA gradient + title/subtitle orange glow + subtitle glass pill

**Decision:** CTA button → dark-indigo-to-signal-orange gradient (legible on light studio photos); title + subtitle → signal-orange text-shadow glow; subtitle → frosted dark glass pill backdrop; `useTextScramble` → `useTextCycle` (smooth CSS crossfade replaces RAF scramble); `ArrowRight` SVG → `Sparkles` lucide-react on left.

**Rationale:**

- Prior frosted-white glass CTA was invisible on light/white photo backgrounds. Gradient `rgba(15,20,38,0.88)→rgba(255,95,31,0.78)` reads on any photo.
- Title orange glow: `text-shadow: 0 0 48px rgba(255,95,31,0.45)` — `.hero-title-glow` CSS class added, Tailwind `drop-shadow-[...]` + `text-white` removed from JSX.
- Subtitle glass pill: `background: rgba(15,20,38,0.32); backdrop-filter: blur(10px)` + orange glow text-shadow; font-size 12px→13px desktop, 9px→10px mobile.
- `useTextCycle` replaces `useTextScramble` — `setTimeout(FADE_OUT_MS=420)` two-phase fade; returns `{displayed, fading}`; `hero-subtitle-fading` CSS class triggers ease-out, removal triggers ease-in via CSS transition. Deprecated alias kept.
- `.zehn-cta-glow` — orange outer ring `rgba(255,95,31,0.5)` replaces white ring.

**Artifacts:** `app/styles/app.css`, `app/components/zehn/Hero.tsx`, `app/lib/hero-text-shuffle.ts`

---

## 2026-06-22 | Claude | UX | REQ-0003 — Hero CTA + subtitle + stagger entrance

**Decision:** Rebuild hero text overlay: glassmorphic white-text CTA, scramble subtitle, CSS stagger entrance, slide re-animation via key.

**Rationale:**

- `CtaShineButton` — switch to white text (`text-white`) + semi-transparent glass (`rgba(255,255,255,0.13)`, `backdrop-filter:blur(20px) saturate(180%)`); hover brightens to `rgba(255,255,255,0.24)`; arrow SVG icon beside ENTDECKEN.
- `.zehn-cta-glow` — strengthened to 6-layer shadow (white ring + dark ambient + signal-orange glow).
- `app/lib/hero-text-shuffle.ts` (new) — `useTextScramble` hook; returns `null` on server (SSR guard), `phrases[0]` after first `useEffect`, cycles with RAF letter-scramble at ~60fps.
- `Hero.tsx` — `HeroTextOverlay` sub-component; subtitle gated with `subtitle !== null` → zero hydration mismatch; `key={`desktop-text-${activeSlide}`}` on overlay wrapper → CSS `hero-reveal` animations re-trigger on every slide change.
- CSS — `@keyframes hero-reveal` (opacity + translateY + blur); `.hero-reveal-delay-1/2` for 180ms/360ms staggered entrance; `.hero-subtitle-desktop/mobile` — tabular-nums, tracking, text-shadow; `prefers-reduced-motion` override to fade-only.

**Artifacts:** `app/lib/hero-text-shuffle.ts`, `app/components/zehn/CtaShineButton.tsx`, `app/components/zehn/Hero.tsx`, `app/styles/app.css`

---

## 2026-06-22 | Cursor Agent | UX | REQ-0004

**Decision:** Announcement bar semantic icons inline left of slide text.

**Rationale:**

- `announcement-bar-content.ts` — typed slides (Truck, Receipt, Sparkles) + compact icon tokens.
- Icon + text share transition wrapper; bar height 26/29px unchanged (header stack frozen).
- Lucide chevrons replace inline SVG for nav consistency.

**Artifacts:** `announcement-bar-content.ts`, `AnnouncementBar.tsx`

---

## 2026-06-22 | Cursor Agent | FIX | REQ-0008

**Decision:** Filter row clipping fix + centered 3-col trigger layout.

**Rationale:**

- `overflow-x-hidden` on filter row forced `overflow-y: auto` — clipped boty-shadow and showed spurious scrollbar thumb.
- `FILTER_BAR_SHELL` with `overflow-visible pb-4` — shadow clearance above border.
- `CustomSelect layout="filter"` — grid icon | centered label | chevron; no hover scale; z-20 when open.
- Removed redundant "Filter:" prefix; icons + short placeholders are affordance.

**Artifacts:** `product-filter-ui.ts`, `CustomSelect.tsx`, `DesktopProductFilterRow.tsx`, route shells

---

## 2026-06-22 | Cursor Agent | UX | REQ-0008

**Decision:** Shared desktop collection filter row — icons, flex-wrap, clear ripple.

**Rationale:**

- Duplicated filter row in 4 routes caused horizontal overflow at `lg` — `flex-wrap` + `overflow-x-hidden` on shared row.
- `CustomSelect` optional lead icon (Euro, Ruler, Palette); wider `min-w-*` per filter kind.
- `FilterClearButton` matches `h-[40px]` select height; `RotateCcw` + `RippleButton` nav hover parity.
- `DesktopProductFilterRow` + `product-filter-ui.ts` centralize options and tokens.

**Artifacts:** `product-filter-ui.ts`, `CustomSelect.tsx`, `FilterClearButton.tsx`, `DesktopProductFilterRow.tsx`, `collections.$handle.tsx`, `collections.all.tsx`, `search.tsx`, `ProductGrid.tsx`

---

## 2026-06-22 | Cursor Agent | POLISH | REQ-0008

**Decision:** Lock-only scrollbar gutter, shared scroll-edge tokens, cart ripple parity.

**Rationale:**

- Always-on `scrollbar-gutter: stable` left a visible idle gutter on homepage banner — moved to `html[data-zehn-scroll-lock]` only.
- `zehn-scrollbar-styles.ts` + `.zehn-scroll-edge` — thin transparent inner scroll for cart, search, quick-add, dropdowns, filter selects.
- `CustomSelect` uses `min-h-0 max-h-[min(280px,50vh)]` — short lists shrink; long lists scroll with edge tokens (removed dead Tailwind scrollbar plugin classes).
- Cart close X + CTAs use `RippleButton` + nav host tokens — orange ripple matches header.
- Removed debug ingest fetch blocks from Header, scroll-lock, CartDrawer.

**Artifacts:** `zehn-scrollbar-styles.ts`, `app.css`, `scroll-lock.ts`, `zehn-surface-styles.ts`, `CustomSelect.tsx`, `CartDrawer.tsx`, `SearchModal.tsx`, `QuickAddModal.tsx`, `Header.tsx`

---

## 2026-06-22 | Cursor Agent | FIX | REQ-0008

**Decision:** Faster mobile navigate-close, menu scroll-lock, cart slide-out exit.

**Rationale:**

- Mobile close still waited ~445ms stagger timer despite idle row stagger — removed; navigate uses 200ms shell collapse.
- `useScrollLock` while mobile menu mounted — prevents page scrollbar flicker on leaf navigation.
- `useOverlayCloseAnimation` + `animate-slide-out-right` — cart closes with reverse slide like open.

**Artifacts:** `Header.tsx`, `useOverlayCloseAnimation.ts`, `CartDrawer.tsx`, `app.css`, `scroll-lock.ts`

---

## 2026-06-22 | Cursor Agent | FIX | REQ-0008

**Decision:** Mobile menu content freeze on close + scrollbar-stable overlay lock.

**Rationale:**

- Mobile row exit-stagger faded items to empty drawer on navigate; mobile `closing` now maps stagger to `idle` (rows stay visible).
- `freezeContent` on `MobileCollectionMenuSection` keeps nested `CategoryMenuPanel` mounted during close.
- Global `scrollbar-gutter: stable` + ref-counted `useScrollLock` replaces ad-hoc `body.style.overflow` in cart, search, quick-add, filter drawer, PDP modals — no horizontal layout shift.

**Artifacts:** `nav-menu-phase.ts`, `scroll-lock.ts`, `useScrollLock.ts`, `app.css`, `Header.tsx`, `SearchModal.tsx`, `CartDrawer.tsx`, `QuickAddModal.tsx`, `CollectionFilters.tsx`, `products.$handle.tsx`, tests

---

## 2026-06-22 | Cursor Agent | FIX | REQ-0008

**Decision:** Mobile drawer close — unified `NavMenuPhase`, two-step close, freeze accordion on navigate.

**Rationale:**

- Root cause: single timer set stagger `idle` + cleared accordions while shell still visible → main-title flash + double-close feel.
- `nav-menu-phase.ts` shares lifecycle with desktop; `mobileMenuPhase` replaces dual booleans.
- Close sequence: stagger exit (phase `closing`) → shell `max-h-0` → `finishCloseMobileMenu` idle + cleanup.
- `shouldFreezeMobileAccordion` blocks pathname auto-expand during close; burger X until fully closed.
- Removed unused `ZEHN_DROPDOWN_POSITIONER_HIDDEN`.

**Artifacts:** `nav-menu-phase.ts`, `nav-menu-phase.test.ts`, `Header.tsx`, `zehn-surface-styles.ts`

---

## 2026-06-22 | Cursor Agent | IMPLEMENT | REQ-0008

**Decision:** Nav row stagger + deferred dropdown polish — shared CSS stagger, rAF panel enter, idempotent close.

**Rationale:**

- Desktop category rows (5) and mobile top-level rows (~6) stair in on open, reverse-stair on close; `prefers-reduced-motion` skips delays.
- `ZehnNavStaggerItem` + `nav-stagger-motion.ts` centralize delay math; mobile shell `max-h-0` collapse delayed until stagger exit completes (~445ms for 6 rows).
- `ZehnGlassPanel` enter uses one-frame rAF from `ENTER_FROM`; removed dead `ZEHN_DROPDOWN_POSITIONER_CLOSED`.
- `finishCloseCategoryMenu` guarded with ref; fallback bumped to 380ms so row stagger can finish before unmount.

**Artifacts:** `nav-stagger-motion.ts`, `ZehnNavStaggerItem.tsx`, `usePrefersReducedMotion.ts`, `zehn-surface-styles.ts`, `ZehnGlassPanel.tsx`, `Header.tsx`, `index.ts`, `nav-stagger-motion.test.ts`

---

## 2026-06-22 | Cursor Agent | FIX | REQ-0008

**Decision:** Desktop dropdown exit — panel fade/translate only; no positioner height collapse.

**Rationale:**

- Close used `max-h-0 mt-0 overflow-hidden` on positioner → white `bg-white/95` slab flash in navbar glow gap.
- `categoryMenuPhase` idle | open | closing; positioner stays `mt-3 overflow-visible` during exit.
- `ZehnGlassPanel` motion enter/exit tokens; `onTransitionEnd` + 320ms fallback → `finishCloseCategoryMenu`.

**Artifacts:** `zehn-surface-styles.ts`, `ZehnGlassPanel.tsx`, `Header.tsx`, `index.ts`

---

## 2026-06-22 | Cursor Agent | FIX | REQ-0008

**Decision:** Desktop dropdown glow clip — separate overflow from `ZEHN_SURFACE_GLOW` shell.

**Rationale:**

- Outer `#zehn-desktop-category-menu` used `overflow-y-auto` when open, clipping child `box-shadow` at sharp rectangle (looked like double layer).
- Navbar glow works because surface + glow share one node with no overflow clip.
- Added positioner/scroll/bleed tokens; `ZehnGlassPanel` (glow shell + inner scroll child); positioner `overflow-visible` when open.

**Artifacts:** `zehn-surface-styles.ts`, `ZehnGlassPanel.tsx`, `Header.tsx`, `index.ts`

---

## 2026-06-22 | Cursor Agent | IMPLEMENT | REQ-0008

**Decision:** Shared nav active-state lib — exact leaf match, descendant accordion rows, all/shop-all root normalize, mobile drawer auto-expand.

**Rationale:**

- Prefix `startsWith(linkUrl)` double-highlighted **Alle HOSEN** + child (e.g. Chinohosen) in sub-sub lists.
- Kollektion menu `/collections/all` did not match `/collections/shop-all/…` subtree when drawer collapsed.
- `app/lib/header-nav-active.ts`: `isNavLinkActive` (exact | descendant), `isNavCollectionRootActive`, `parseCollectionNavPath`, `resolveMobileNavOpenState`.
- Drawer open (edge-trigger): auto-set `openMobileCollection` + `initialOpenSection` from pathname; user can still collapse manually.

**Artifacts:** `header-nav-active.ts`, `Header.tsx`, `header-nav-active.test.ts`

---

## 2026-06-22 | Cursor Agent | IMPLEMENT | REQ-0008

**Decision:** Mobile split-tap accordion nav — label `Link` navigates; chevron toggles sub-panel only.

**Rationale:**

- Entire-row `<button>` blocked navigation to KOLLEKTION / NEUHEITEN / section URLs on `<lg`.
- `HeaderNavAccordionRow`: left link (`onNavigate` closes drawer) + right 44px chevron (`onToggle` only).
- `CategoryMenuPanel` gains `interactionMode`: `toggleRow` (desktop dropdown, unchanged) vs `splitRow` (mobile nested).
- Mobile drawer: `HEADER_NAV_MOBILE_MENU_MAX_H` = `calc(100dvh - 102px)` (frozen `SITE_HEADER_STACK.mobile`); inner `overflow-y-auto` replaces `75vh` shell scroll.

**Artifacts:** `header-nav-styles.ts`, `HeaderNavAccordionRow.tsx`, `Header.tsx`, `index.ts`

---

## 2026-06-22 | Cursor Agent | CLEANUP | REQ-0008

**Decision:** Remove dead `CategoryMenuPanel` showHeading block; drop redundant `getMobileCollectionTitle`.

**Rationale:** `TITLE_OVERRIDES` already sets Kollektion on `menuItems`; mobile uses `item.title`. Removed unused `showHeading`, `headingTitle`, `shopAllUrl` props.

**Artifacts:** `Header.tsx`, `header-nav-styles.ts`

---

## 2026-06-22 | Cursor Agent | IMPLEMENT | REQ-0008

**Decision:** Dropdown + mobile menu UI polish — shared nav tokens, no underline, Kollektion on mobile.

**Rationale:**

- `cnHeaderNavDropdownSection` / `cnHeaderNavDropdownLink` reuse `HEADER_NAV_LABEL` + accent colors (desktop + mobile).
- Removed underline on open/hover; route-active child links use `text-accent`.
- Mobile: `getMobileCollectionTitle` + `TITLE_OVERRIDES` → Kollektion; `HEADER_NAV_MOBILE_SUBMENU_INDENT` for nested list hierarchy.
- `HEADER_NAV_DROPDOWN_SUBLIST` for indented sub-links under accordion sections.

**Artifacts:** `header-nav-styles.ts`, `Header.tsx`

---

## 2026-06-22 | Cursor Agent | IMPLEMENT | REQ-0008

**Decision:** Compact desktop nav spacing (Option A) — text-width links, tighter gap, Shop All label.

**Rationale:**

- Pill `px-3/px-4` + `gap-6/8` made nav wider than production; compact host uses color-only hover + text-width ripple.
- `HEADER_NAV_TEXT_HOST_COMPACT` default in `cnHeaderNavTextHost`; pill variant retained.
- `DESKTOP_SHOP_ALL_NAV_LABEL` = Shop All (replaces Alle Produkte); gap `gap-4 lg:gap-5`.
- `showHeading` block commented as unused (not removed).

**Artifacts:** `header-nav-styles.ts`, `Header.tsx`, `HeaderNavItem.tsx`

---

## 2026-06-22 | Cursor Agent | IMPLEMENT | REQ-0008

**Decision:** Desktop nav dropdown polish — Alle Produkte pill replaces burger; dropdown headings removed; shared glow surfaces; glass CTA shine.

**Rationale:**

- Desktop `lg+`: burger removed; `Alle Produkte` `HeaderNavLink` uses same hover-dropdown as NEUHEITEN/BESTSELLER/SALE.
- `CategoryMenuPanel` `showHeading={false}` on desktop — no SHOP ALL / collection subtitle in dropdown.
- `zehn-surface-styles.ts`: `ZEHN_NAV_SURFACE`, `ZEHN_DROPDOWN_SURFACE`, `ZEHN_SURFACE_GLOW` — unified `rounded-2xl` + Signal halo.
- `CtaShineButton`: `RippleButton` + CSS `cta-shine` per RIPPLE_BUTTON_EFFECT.md (no hydration risk).
- Mobile `<lg` unchanged; REQ-0004 header stack untouched.

**Artifacts:**

- **Added:** `app/lib/zehn-surface-styles.ts`, `app/components/zehn/CtaShineButton.tsx`
- **Updated:** `Header.tsx`, `Hero.tsx`, `app/styles/app.css`, `app/components/zehn/index.ts`

**Linked:** REQ-0008, BUILD_MANIFEST ART-0013.x

---

## 2026-06-22 | Cursor Agent | IMPLEMENT | REQ-0008, REQ-0001

**Decision:** Nav title pill hover hosts — padded text links matching icon hover disc + ripple boundary.

**Rationale:**

- Desktop titles (NEUHEITEN, BESTSELLER, SALE) had ripple clipped to glyph width; icons use 44px circular host with `hover:bg-foreground/[0.06]`.
- `HEADER_NAV_TEXT_HOST` + `cnHeaderNavTextHost`: pill shape, `min-h-[44px]`, `px-3 xl:px-4`, static Tailwind only (no CLS / hydration risk).
- Mobile drawer rows (`HEADER_NAV_MOBILE_ROW`): `rounded-lg px-3` + same hover disc for wishlist/cart ripple parity.
- REQ-0004 frozen: no change to `h-[68px]` nav row or header stack.
- Nav title underline removed via `no-underline` on color tokens (global `a:hover` reset).

**Artifacts:**

- **Updated:** `app/lib/header-nav-styles.ts`, `app/components/zehn/HeaderNavItem.tsx`
- **Cleaned:** `.playwright-mcp/` debug console/page logs

**Linked:** BL-0007 follow-up, BUILD_MANIFEST ART-0012.3

---

## 2026-06-22 | Cursor Agent | IMPLEMENT | REQ-0001, REQ-0008, REQ-0005

**Decision:** Navbar UI polish — unified nav tokens, RippleButton, Signal accent hover/active, circular icon hosts.

**Rationale:**

- Nav titles and icons used mismatched weight/color (`hover:text-foreground` vs semibold labels).
- Reusable `RippleButton` per RIPPLE_BUTTON_EFFECT.md; client-only pointerdown ripple (no hydration risk).
- `HeaderNavLink` / `HeaderNavIconButton` wrappers keep Header.tsx maintainable.
- Active states: route match, menu/search/cart toggles; mobile drawer rows aligned.
- REQ-0004 frozen stack unchanged (no height/position edits).

**Artifacts:**

- **Added:** `app/lib/header-nav-styles.ts`, `app/components/zehn/RippleButton.tsx`, `app/components/zehn/HeaderNavItem.tsx`
- **Updated:** `app/components/zehn/Header.tsx`, `app/styles/app.css`, `app/components/zehn/index.ts`

**Linked:** BL-0007, BUILD_MANIFEST ART-0012.1–0012.3

---

## 2026-06-22 | Cursor Agent | ACTIVATE | C1 Agile V

**Decision:** Re-activate and sync full `.agile-v/` C1 bootstrap from last session state; enable Infinity Loop on every prompt.

**Rationale:**

- Stakeholder requested `/agile-v-core` activation with full traceability from work completed 2026-06-20.
- Git now connected: local `zehn-frontend` → `origin/development` @ `ea7cdff`.
- REQ-0003 moved from deferred to VERIFY; TC-0005 pending stakeholder sign-off.
- Updated STATE, PLAYBOOK, config.json, ATM, EVAL_RESULTS, TEST_SPEC, POLICY (header stack sync paths), CLAUDE.md, AGENTS.md.

**Artifacts:** `.agile-v/*`, `CLAUDE.md`, `AGENTS.md`

**Linked:** CR-0004, STATE.md, TRACE_LOG

---

## 2026-06-20 | Cursor Agent | IMPLEMENT | REQ-0003 + REQ-0004

**Decision:** Complete hero fold geometry refactor + 3px navbar floating gap with coordinated header stack update.

**Rationale:**

- Single width-based fold height (`100vw/2.5 + img_top` desktop, `100vw×1.25 + img_top` mobile) eliminates zoom jump at ~1580px and keeps image box at native banner aspect ratio.
- Offset geometry (`--hero-fold-img-offset` 25px / mobile 39px) hides studio blank behind fixed header; heads visible below navbar.
- Edge gradient + `--hero-fold-bg: #e1e2e6` masks left-edge color mismatch on slide 1.
- `max-height: min(95dvh, 100dvh - 100px)` preserves Sommerseite visibility on large desktops.
- Short-viewport shoe clip accepted as edge case; prefer banner JPG bottom padding (client asset) over dvh-based refit (would reintroduce zoom issues).
- Navbar 3px gap: Header `top-[29px] sm:top-[32px]`; stack totals 102/106px synced across four files.

**Artifacts:**

- **Added:** `app/styles/homepage-hero.css` (primary fold CSS), `CLAUDE.md`
- **Updated:** `Hero.tsx`, `site-header-stack.ts`, `Header.tsx`, `PageLayout.tsx`, `.agile-v/*`

**Verification:** `npm run typecheck` PASS; stakeholder confirmed navbar gap fix.

**Linked:** REQ-0003, REQ-0004, BL-0003, BUILD_MANIFEST ART-0002.3–0010.1

---

## 2026-06-19 | Cursor Agent | IMPLEMENT | REQ-0003

**Decision:** Revert 92/8 fold + `HomepageCategoryNav`; adopt simplified hero-only architecture.

**Rationale:**

- Duplicate category row in fold conflicted with ProductGrid (single source of truth for SHORTS/HOSEN chips).
- Hero-only fold (`90dvh` mobile / `95dvh` desktop) gives more banner area without duplicating UI.
- Restored upward img bleed under fixed header stack (102/106px) addresses heads-under-navbar clipping.
- Per-slide `objectPosition` + laptop `@media (max-height: 820px)` band in `app.css` for 14" framing.

**Artifacts:**

- **Removed:** `app/components/zehn/HomepageCategoryNav.tsx`
- **Added:** `app/lib/site-header-stack.ts`
- **Updated:** `Hero.tsx`, `_index.tsx`, `ProductGrid.tsx`, `app/styles/app.css`

**Linked:** REQ-0003 AC #5 (chips in ProductGrid below fold), BL-0003, BUILD_MANIFEST ART-0002.2–0009.2

---

## 2026-06-19 | Cursor Agent | DEFER | REQ-0003

**Decision:** Pause homepage hero crop work; mark REQ-0003 / BL-0003 as **ongoing / deferred** for a future Agile V session.

**Rationale:**

- Multiple CSS-only approaches (`object-position`, img bleed, fluid `clamp`, 92/8 viewport fold) did not achieve acceptable framing on desktop monitor and 14" laptop across all three banner slides.
- Header stack (REQ-0004) remains frozen; fixes are constrained to hero/fold files only.
- Stakeholder agreed to revisit later rather than continue ad-hoc tuning.

**Artifacts in repo at defer:**

- `app/routes/_index.tsx` — `data-homepage-fold`, 92%/8% split
- `app/components/zehn/HomepageCategoryNav.tsx` — category strip in fold
- `app/components/zehn/Hero.tsx` — `h-full`, simplified object-position
- `app/components/zehn/ProductGrid.tsx` — `hideCategoryNav`, controlled category props

**Next session options:**

1. Per-slide `objectPosition` tuning after fold stabilizes layout math
2. Adjust fold ratio (e.g. 90/10 on mobile)
3. Banner asset padding (studio grey extension at top/bottom of JPGs)
4. Independent visual review at 1440 / 1280 / 390 before further code changes

**Linked:** REQ-0003, BL-0003, STATE.md

---

## 2026-06-19 | Cursor Agent | BOOTSTRAP | C1

**Decision:** Activate full `.agile-v/` C1 bootstrap — sync all artifacts from prior hero fold work and defer state.

**Rationale:** Stakeholder requested Agile V Infinity Loop active for all future prompts. Partial `.agile-v/` existed; expanded to full AQMS artifact set per agile-v-core.

**Produced:** PLAYBOOK, POLICY, config.json, BUILD_MANIFEST, TEST_SPEC, VALIDATION_SUMMARY, ATM, RISK_REGISTER, EVAL_RESULTS, TRACE_LOG, phase dirs, SPRINT_PLAN_C1, AGENTS.md.

**Resume point:** Stage 4 Verification; REQ-0003 deferred; await stakeholder instruction.

**Linked:** STATE.md, CR-0002
