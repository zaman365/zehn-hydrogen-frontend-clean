# Agile V Playbook — ZEHN Hydrogen Frontend

<!-- Cycle: C1 | Version: 1.1 | Updated: 2026-06-22 | Status: ACTIVATED -->

## Purpose

Every chat session on **zehn-hydrogen-frontend** follows the **Agile V Infinity Loop**: Specify → Constrain → Orchestrate → Prove → Evolve → Verify — with full REQ traceability.

**Activation:** `config.json` → `agile_v.status` = `ACTIVATED`. Load `agile-v-core` first.

## Session start (mandatory)

1. [`CLAUDE.md`](../CLAUDE.md) — session resume
2. [`.agile-v/STATE.md`](STATE.md) — cycle, stage, blockers, git
3. [`.agile-v/CHECKPOINTS.md`](CHECKPOINTS.md) — resume any `PENDING` Human Gate
4. [`.agile-v/REQUIREMENTS.md`](REQUIREMENTS.md) — map request → `REQ-XXXX`
5. [`.agile-v/BACKLOG.md`](BACKLOG.md) — pick `BL-XXXX`
6. [`.agile-v/POLICY.yaml`](POLICY.yaml) — frozen paths, halt conditions

## Infinity Loop (per prompt)

```
User instruction
  → Specify: confirm REQ + acceptance criteria
  → Constrain: frozen paths, React Router 7, Hydrogen patterns
  → Orchestrate: minimal diff in scoped files
  → Prove: typecheck, vitest, visual breakpoints
  → Evolve: append DECISION_LOG.md, update BUILD_MANIFEST / STATE
  → Verify: Red Team style checklist (independent read of diff vs REQ)
```

## 5-stage pipeline

| Stage | Phase dir | Primary output | Gate |
|---|---|---|---|
| 1 Requirements | `phases/01-requirements/` | REQUIREMENTS.md, BACKLOG.md | — |
| 2 Validation | `phases/02-validation/` | Logic constraints, risk flags | **Human Gate 1** |
| 3 Synthesis | `phases/03-synthesis/` | Code in `app/`, BUILD_MANIFEST.md | — |
| 4 Verification | `phases/04-verification/` | VALIDATION_SUMMARY.md, TEST_SPEC runs | — |
| 5 Acceptance | `phases/05-acceptance/` | APPROVALS.md, archive to `cycles/C1/` | **Human Gate 2** |

## Current position (C1)

| Field | Value |
|---|---|
| **Stage** | 4 — Verification |
| **Active REQ** | REQ-0003 (VERIFY — code on `development` @ `ea7cdff`) |
| **Next work** | TC-0005 visual sign-off → BL-0005 mobile audit |

## Agent skills (load on demand)

| Skill | When |
|---|---|
| `agile-v-core` | **Every session** (values, traceability, SCOPE-V) |
| `agile-v-pipeline` | Multi-stage orchestration, handoffs |
| `agile-v-lifecycle` | CRs, cycle boundaries, archival |
| `agile-v-compliance` | Gates, risk, CAPA, approvals |
| `agile-v-quality-gates` | Interface/test/data-type checks |
| `agile-v-product-owner` | Backlog grooming, sprint planning |
| `requirement-architect` | New REQs |
| `logic-gatekeeper` | Stage 2 validation |
| `build-agent-js` | Hydrogen / React implementation |
| `test-designer` | TEST_SPEC updates |
| `red-team-verifier` | Independent verification |
| `compliance-auditor` | ATM, gate records |
| `discovery-analyst` | Scope / domain research |
| `ux-spec-author` | UI acceptance criteria |
| `threat-modeler` | Security-sensitive changes |
| `observability-planner` | Logging / monitoring |
| `release-manager` | Deploy / Oxygen promotion |

## UI bug fix workflow (this project)

1. Map issue → `REQ-XXXX` in REQUIREMENTS.md
2. Edit minimal files under `app/components/zehn/` or route TSX
3. Header stack changes: update **all** sync points (see `config.json` → `header_stack_sync_points`)
4. Do **not** change brand tokens (REQ-0001) without approval
5. Verify: 390 / 1280 / 1440 / 1920px + `npm run typecheck`
6. Log: DECISION_LOG + BUILD_MANIFEST + STATE
7. Commit/push: `git push origin development`

## Git workflow

| Item | Value |
|---|---|
| Remote | `zaman365/zehn-hydrogen-frontend-clean` |
| Branch | `development` |
| Local | `~/Projects/Shopify-Hydrogen/zehn-frontend` |

## Evidence summary (end of session)

```
Scope: [produced/validated] | Traceability: [REQ-IDs] | Findings: [PASS/FAIL/FLAG]
Decision Points: [choices] | Log: [TIMESTAMP | AGENT | DECISION | RATIONALE | REQ]
```

## Key project docs

- [`Docs/project-idea/PROJECT_WALKTHROUGH.md`](../Docs/project-idea/PROJECT_WALKTHROUGH.md)
- [`Docs/HOMEPAGE_LAYOUT.md`](../Docs/HOMEPAGE_LAYOUT.md)
- [`.cursor/rules/hydrogen-react-router.mdc`](../.cursor/rules/hydrogen-react-router.mdc)
