# Agile V — Project State

<!-- Revision: C1 | Updated: 2026-06-20 | Session end: hero framing + navbar gap -->

| Field | Value |
|---|---|
| **Cycle** | C1 |
| **Pipeline stage** | **4 — Verification** (UI polish stream) |
| **Infinity loop phase** | **Verify → Accept** (REQ-0003 near complete) |
| **Sprint** | C1-S1 (open) |
| **Overall status** | **ACTIVE** |
| **Last sync** | 2026-06-20 |
| **Resume token** | — (no pending checkpoint) |

## Bootstrap status

| Artifact | Status |
|---|---|
| PLAYBOOK.md | ✅ |
| POLICY.yaml | ✅ |
| config.json | ✅ |
| REQUIREMENTS.md | ✅ synced (REQ-0001–0020) |
| BACKLOG.md | ✅ |
| BUILD_MANIFEST.md | ✅ updated 2026-06-20 |
| TEST_SPEC.md | ✅ |
| VALIDATION_SUMMARY.md | ✅ updated 2026-06-20 |
| ATM.md | ✅ |
| DECISION_LOG.md | ✅ updated 2026-06-20 |
| CHANGE_LOG.md | ✅ updated 2026-06-20 |
| RISK_REGISTER.md | ✅ |
| APPROVALS.md | ✅ |
| EVAL_RESULTS.md | ✅ |
| TRACE_LOG.md | ✅ updated 2026-06-20 |
| CHECKPOINTS.md | ✅ |
| Phase dirs (01–05) | ✅ |
| CLAUDE.md | ✅ created 2026-06-20 |

## Current focus

**Primary:** Stakeholder visual sign-off on REQ-0003 hero framing (code complete 2026-06-20).

**Secondary:** Client decision on banner JPG padding below shoes (asset-only; no code required).

## Open items

| ID | Item | REQ | Status |
|---|---|---|---|
| BL-0003 | Homepage hero image crop & viewport framing | REQ-0003 | **VERIFY** — implementation done; pending formal TC-0005 sign-off |
| — | Banner asset padding (studio floor below shoes) | REQ-0003 | **OPTIONAL** — client discussion; recommended over CSS |

## Resolved this session (2026-06-20)

- Desktop zoom jump at ~1580px — single `100vw/2.5` fold formula
- Mobile head under navbar — mobile offset geometry
- Header/hero color seam — `#e1e2e6` + edge gradient
- Navbar floating 3px gap — stack 102/106px synced everywhere
- Short-viewport shoe clip — accepted as edge case; asset padding preferred fix

## Frozen constraints (POLICY.yaml)

- REQ-0001: design-tokens.ts (no change without approval)
- REQ-0004: header stack — **modified 2026-06-20** (+3px floating gap; stack 102/106). Any future change must sync all four files.

## Key implementation files

| File | Role |
|---|---|
| `app/styles/homepage-hero.css` | Fold geometry, CSS vars, edge gradient |
| `app/components/zehn/Hero.tsx` | Slider, object-position |
| `app/lib/site-header-stack.ts` | SITE_HEADER_STACK 102/106 |
| `app/components/zehn/Header.tsx` | `top-[29px] sm:top-[32px]` |
| `app/components/PageLayout.tsx` | `pt-[102px] sm:pt-[106px]` |
| `app/routes/_index.tsx` | `data-homepage-hero-fold` |
| `app/components/zehn/AnnouncementBar.tsx` | 26/29px (unchanged) |

## Resume checklist (start tomorrow)

1. Read `CLAUDE.md` + this file
2. Hard refresh homepage at **390**, **1280×800**, **1440×900**, **1920×1080** — all 3 slides
3. Confirm: heads below navbar, shoes visible, Sommerseite/filter row visible on desktop, 3px navbar gap
4. If pass → mark BL-0003 done, update VALIDATION_SUMMARY + EVAL_RESULTS
5. Commit if not yet committed
6. Discuss banner JPG bottom padding with client (optional)
7. Next: BL-0005 mobile audit

## Verification commands

```bash
npm run typecheck
npx vitest run
npm run dev   # http://localhost:3000
```
