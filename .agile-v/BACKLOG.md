# Backlog — ZEHN Hydrogen Frontend

<!-- Revision: C1 | Updated: 2026-06-20 | Groomed at bootstrap -->

## Priority order (C1 UI polish)

1. BL-0003 — Hero crop (**VERIFY** — code done 2026-06-20)
2. BL-0007 — Navbar interaction polish (**DONE** 2026-06-22)
3. BL-0005 — Mobile responsiveness audit
3. BL-0006 — Layout shift / flicker
4. BL-0002 — Typography test alignment

---

## BL-0003: Homepage hero image crop & viewport fold

| Field | Value |
|---|---|
| **Type** | Bug / UI polish |
| **Priority** | HIGH |
| **REQ** | REQ-0003 |
| **ART** | ART-0001.1 – ART-0004.1 |
| **Status** | **VERIFY** — implementation complete 2026-06-20; pending stakeholder sign-off |
| **Effort** | M |

**Story:** As a shopper, I want the hero banner to display correctly on all screen sizes, so that models are fully visible and category chips are always on the first screen.

**Acceptance:** REQ-0003 AC 1–5; all three slider slides.

**Session notes (2026-06-20):** Width-based fold in `homepage-hero.css`; stack 102/106; edge gradient; navbar 3px gap. Optional: client extends banner JPGs with studio padding below shoes for short-viewport edge case.

---

## BL-0007: Navbar interaction polish

| Field | Value |
|---|---|
| **Type** | Enhancement / UI polish |
| **Priority** | HIGH |
| **REQ** | REQ-0001, REQ-0008, REQ-0005 |
| **Status** | **DONE** — 2026-06-22 |
| **Effort** | S |

**Story:** Unified nav label/icon styling, Signal accent hover/active, ripple on click, circular icon hosts, pill text hosts.

**Artifacts:** `RippleButton.tsx`, `HeaderNavItem.tsx`, `header-nav-styles.ts`, `Header.tsx`

**Session notes (2026-06-22):** Pill hover hosts on desktop titles; mobile drawer row hover; Alle Produkte replaces desktop burger; dropdown headings removed; nav/dropdown glow; ENTDECKEN CtaShineButton.

---

## BL-0004: Fixed header stack

| Field | Value |
|---|---|
| **Type** | Constraint |
| **REQ** | REQ-0004 |
| **Status** | Done (frozen) |

---

## BL-0005: Mobile responsiveness audit

| Field | Value |
|---|---|
| **Type** | Enhancement |
| **Priority** | HIGH |
| **REQ** | REQ-0005 |
| **Status** | Backlog |
| **Effort** | L |

Validate key routes at 390px against production zehnfashion.de.

---

## BL-0006: Layout shift & flicker reduction

| Field | Value |
|---|---|
| **Type** | Enhancement |
| **Priority** | MEDIUM |
| **REQ** | REQ-0006 |
| **Status** | Backlog |

---

## BL-0002: Typography test / font alignment

| Field | Value |
|---|---|
| **Type** | Tech debt |
| **Priority** | LOW |
| **REQ** | REQ-0001 |
| **Status** | Backlog |

Align vitest expectations with `root.tsx` font loading (Archivo Black drift).

---

## Out of scope (C1)

| BL | REQ | Note |
|---|---|---|
| — | REQ-0019 | RMS — `.full-stack-feature/` |
| — | REQ-0020 | SEO tooling |
