# Agile V Playbook — ZEHN Hydrogen Frontend

<!-- Cycle: C1 | Version: 1.0 | Updated: 2026-06-19 -->

## Purpose

This playbook defines how every chat session on **zehn-hydrogen-frontend** follows the **Agile V Infinity Loop**: Specify → Constrain → Orchestrate → Prove → Evolve → Verify — with full REQ traceability.

## Session start (mandatory)

1. Read [`.agile-v/STATE.md`](STATE.md) — current cycle, stage, blockers
2. Read [`.agile-v/CHECKPOINTS.md`](CHECKPOINTS.md) — resume any `PENDING` Human Gate
3. Read [`.agile-v/REQUIREMENTS.md`](REQUIREMENTS.md) — map user request → `REQ-XXXX`
4. Read [`.agile-v/BACKLOG.md`](BACKLOG.md) — pick or create `BL-XXXX`
5. Honor [`.agile-v/POLICY.yaml`](POLICY.yaml) — frozen paths, halt conditions

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
| **Stage** | 4 — Verification (UI polish) |
| **Active REQ** | REQ-0003 (deferred) |
| **Next work** | Per stakeholder instruction; resume REQ-0003 when approved |

## Agent skills (load on demand)

| Skill | When |
|---|---|
| `agile-v-core` | Every session (values, traceability, SCOPE-V) |
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

## UI bug fix workflow (this project)

1. Map issue → `REQ-XXXX` in REQUIREMENTS.md
2. Edit minimal files under `app/components/zehn/` or route TSX
3. Do **not** change frozen header stack (REQ-0004) or brand tokens (REQ-0001) without approval
4. Verify: 390px, 1280px, 1440px + `npm run typecheck`
5. Log: DECISION_LOG.md + BUILD_MANIFEST.md + STATE.md

## Evidence summary (end of session)

```
Scope: [produced/validated] | Traceability: [REQ-IDs] | Findings: [PASS/FAIL/FLAG]
Decision Points: [choices] | Log: [TIMESTAMP | AGENT | DECISION | RATIONALE | REQ]
```

## Key project docs

- [`Docs/project-idea/PROJECT_WALKTHROUGH.md`](../Docs/project-idea/PROJECT_WALKTHROUGH.md)
- [`Docs/HOMEPAGE_LAYOUT.md`](../Docs/HOMEPAGE_LAYOUT.md)
- [`.cursor/rules/hydrogen-react-router.mdc`](../.cursor/rules/hydrogen-react-router.mdc)
