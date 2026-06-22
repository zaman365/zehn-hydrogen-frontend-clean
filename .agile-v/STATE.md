# Agile V — Project State

<!-- Revision: C1 | Updated: 2026-06-22 | Status: ACTIVATED -->

| Field | Value |
|---|---|
| **Cycle** | C1 |
| **Pipeline stage** | **4 — Verification** (UI polish stream) |
| **Infinity loop phase** | **Verify → Accept** (REQ-0003 near complete) |
| **Sprint** | C1-S1 (open) |
| **Overall status** | **ACTIVE — Agile V Infinity Loop enabled** |
| **Last sync** | 2026-06-22 |
| **Resume token** | — (no pending checkpoint) |
| **Agile V activation** | ✅ **ON** — follow PLAYBOOK.md every prompt |

## Git / delivery

| Field | Value |
|---|---|
| **Local path** | `~/Projects/Shopify-Hydrogen/zehn-frontend` |
| **Remote** | `https://github.com/zaman365/zehn-hydrogen-frontend-clean.git` |
| **Branch** | `development` |
| **Latest commit** | `ea7cdff` — Homepage hero fold geometry and navbar floating gap |
| **Sync** | Up to date with `origin/development` |

## Bootstrap status

| Artifact | Status |
|---|---|
| PLAYBOOK.md | ✅ |
| POLICY.yaml | ✅ |
| config.json | ✅ synced 2026-06-22 |
| REQUIREMENTS.md | ✅ REQ-0001–0020 |
| BACKLOG.md | ✅ |
| BUILD_MANIFEST.md | ✅ |
| TEST_SPEC.md | ✅ |
| VALIDATION_SUMMARY.md | ✅ |
| ATM.md | ✅ synced 2026-06-22 |
| DECISION_LOG.md | ✅ |
| CHANGE_LOG.md | ✅ |
| RISK_REGISTER.md | ✅ |
| APPROVALS.md | ✅ |
| EVAL_RESULTS.md | ✅ |
| TRACE_LOG.md | ✅ |
| CHECKPOINTS.md | ✅ |
| Phase dirs (01–05) | ✅ |
| CLAUDE.md | ✅ |
| AGENTS.md | ✅ |

## Session protocol (every prompt)

1. Read **STATE.md** + **CHECKPOINTS.md** (if any PENDING)
2. Map user request → **REQ-XXXX** + **BL-XXXX**
3. Execute **SCOPE-V**: Specify → Constrain → Orchestrate → Prove → Evolve → Verify
4. On code change: **DECISION_LOG** + **BUILD_MANIFEST** + **STATE** (write-through)
5. Stop at **Human Gates** per PLAYBOOK.md / POLICY.yaml

## Current focus

**Primary:** Stakeholder visual sign-off REQ-0003 / BL-0003 (code + push complete).

**Secondary:** Client banner JPG bottom padding (asset-only, optional).

## Open items

| ID | Item | REQ | Status |
|---|---|---|---|
| BL-0003 | Homepage hero crop & viewport framing | REQ-0003 | **VERIFY** — `ea7cdff` on `development`; TC-0005 pending |
| BL-0005 | Mobile responsiveness audit | REQ-0005 | Backlog (next after BL-0003) |
| — | Banner asset padding below shoes | REQ-0003 | OPTIONAL — client discussion |

## Resolved (C1 to date)

- Hero fold width-based geometry (`homepage-hero.css`)
- Mobile head framing + desktop zoom jump fix
- Color seam (`#e1e2e6` + edge gradient)
- Navbar 3px floating gap; stack **102/106** synced
- Git connected; pushed to client `development` branch
- Short-viewport shoe clip accepted; asset padding preferred

## Frozen constraints (POLICY.yaml)

- **REQ-0001:** `design-tokens.ts` — no change without approval
- **REQ-0004:** Header stack — sync **all** of: AnnouncementBar heights, Header `top`, PageLayout `pt`, `site-header-stack.ts`, `homepage-hero.css` vars

## Key files (hero + header)

| File | Role |
|---|---|
| `app/styles/homepage-hero.css` | Fold geometry, CSS vars, edge gradient |
| `app/components/zehn/Hero.tsx` | Slider, object-position |
| `app/lib/site-header-stack.ts` | SITE_HEADER_STACK 102/106 |
| `app/components/zehn/Header.tsx` | `top-[29px] sm:top-[32px]` |
| `app/components/PageLayout.tsx` | `pt-[102px] sm:pt-[106px]` |
| `app/routes/_index.tsx` | `data-homepage-hero-fold` |

## Resume checklist

1. Read `CLAUDE.md` + this file
2. Visual TC-0005: **390**, **1280×800**, **1440×900**, **1920×1080** — all 3 slides
3. Pass → close BL-0003, update VALIDATION_SUMMARY + EVAL_RESULTS
4. Next backlog: **BL-0005** mobile audit

## Verification commands

```bash
npm run typecheck
npx vitest run
npm run dev   # http://localhost:3000
```

## Evidence summary (last session)

```
Scope: hero fold + navbar gap implemented & pushed | Traceability: REQ-0003, REQ-0004
Findings: typecheck PASS; TC-0005 PENDING stakeholder sign-off
Decision: short-viewport clip accepted; asset padding recommended
```
