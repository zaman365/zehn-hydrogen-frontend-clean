# CLAUDE.md — ZEHN Hydrogen Frontend (session resume)

<!-- Read this + `.agile-v/STATE.md` at the start of every Claude session -->

## Quick start

1. [`.agile-v/STATE.md`](.agile-v/STATE.md) — current stage, blockers, resume checklist
2. [`.agile-v/PLAYBOOK.md`](.agile-v/PLAYBOOK.md) + [`.agile-v/POLICY.yaml`](.agile-v/POLICY.yaml)
3. [`.agile-v/REQUIREMENTS.md`](.agile-v/REQUIREMENTS.md) → map work to `REQ-XXXX`
4. [`.agile-v/BACKLOG.md`](.agile-v/BACKLOG.md) → pick `BL-XXXX`
5. [`AGENTS.md`](AGENTS.md) — Cursor agent load order (same project rules)

## Last session — 2026-06-20

**Focus:** REQ-0003 homepage hero framing + REQ-0004 navbar floating gap.

### Done today

| Area | What changed |
|---|---|
| **Hero fold geometry** | `app/styles/homepage-hero.css` — unified width-based fold height (desktop `100vw/2.5 + img_top`, mobile `100vw×1.25 + img_top`); no zoom jump at ~1580px |
| **Model framing** | `--hero-fold-img-offset` (25px desktop) / `--hero-fold-img-offset-mobile` (39px); `object-position: center 0%` safety |
| **Color seam** | `--hero-fold-bg: #e1e2e6` + 80px edge gradient on `[data-homepage-hero]::after` |
| **Short viewport cap** | `max-height: min(95dvh, 100dvh - 100px)` — keeps Sommerseite visible; shoes may clip only on atypical short/wide windows |
| **Navbar floating gap** | 3px breathing room below announcement bar — `Header.tsx` `top-[29px] sm:top-[32px]` |
| **Header stack sync** | `SITE_HEADER_STACK` mobile **102** / desktop **106** (was 99/103) across `site-header-stack.ts`, `homepage-hero.css`, `PageLayout.tsx` |
| **Hero component** | `Hero.tsx` — CSS-driven positioning only; comments synced to 81px/63px img_top |
| **Verification** | `npm run typecheck` PASS; stakeholder confirmed floating navbar fix |

### Decisions (no further code unless stakeholder asks)

- **Short browser height:** Leave as-is — fold tracks width; `dvh` cap handles dock; dynamic height refit would reintroduce zoom issues.
- **Shoe clip edge case:** Prefer **banner asset padding** (extend JPG studio floor below shoes ~100–150px) over more CSS — client discussion pending.

### Key files (hero + header)

```
app/styles/homepage-hero.css      ← fold geometry, CSS vars, edge gradient
app/components/zehn/Hero.tsx      ← slider, object-position
app/lib/site-header-stack.ts     ← frozen stack constants (102/106)
app/components/zehn/Header.tsx    ← fixed top 29/32px
app/components/PageLayout.tsx     ← main pt-[102px] sm:pt-[106px]
app/components/zehn/AnnouncementBar.tsx  ← unchanged heights 26/29px
app/routes/_index.tsx             ← data-homepage-hero-fold wrapper
```

### Header stack math (current)

| Layer | Mobile | Desktop |
|---|---|---|
| Announcement bar | 26px | 29px |
| Floating gap | 3px | 3px |
| Navbar card | 73px | 74px |
| **Total** | **102px** | **106px** |

`img_top = headerStack − offset` → mobile 63px, desktop 81px.

## Where to start tomorrow

1. **Stakeholder visual sign-off** — REQ-0003 / BL-0003 at **390**, **1280×800**, **1440×900**, **1920×1080**; all 3 slider slides; check heads, shoes, Sommerseite row, no seam.
2. **Commit** — if not committed: hero CSS, Hero.tsx, Header.tsx, PageLayout, site-header-stack.ts.
3. **Client asset task** — extend desktop/mobile banner JPGs with studio padding below shoes (optional long-term fix for short-viewport clip).
4. **Close REQ-0003** — if visual passes: update VALIDATION_SUMMARY, mark BL-0003 done, Gate 2 prep.
5. **Next backlog** — BL-0005 mobile responsiveness audit if hero accepted.

## Frozen / do not break

- REQ-0001 design tokens — no change without approval
- REQ-0004 header stack — any height change must update **all four** sync points (AnnouncementBar heights, Header top, PageLayout pt, `site-header-stack.ts` + `homepage-hero.css` vars)
- React Router 7 imports only — see `.cursor/rules/hydrogen-react-router.mdc`

## Verify before done

```bash
npm run typecheck
npx vitest run
npm run dev   # http://localhost:3000 — visual at 390 / 1280 / 1440 / 1920
```

## Log protocol

On code changes: append `.agile-v/DECISION_LOG.md`, bump `.agile-v/BUILD_MANIFEST.md`, update `.agile-v/STATE.md`.
