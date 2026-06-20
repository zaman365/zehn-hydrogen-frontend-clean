# Decision Log (append-only)

<!-- Agile V — ZEHN Hydrogen Frontend -->

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
