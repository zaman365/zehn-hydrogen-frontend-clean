# AGENTS.md — ZEHN Hydrogen Frontend

<!-- Agent load order | Agile V ACTIVATED 2026-06-22 -->

## Always first

1. [`CLAUDE.md`](CLAUDE.md) — session resume
2. [`.agile-v/STATE.md`](.agile-v/STATE.md) — cycle, stage, git, blockers
3. [`.agile-v/PLAYBOOK.md`](.agile-v/PLAYBOOK.md) — Infinity Loop protocol
4. [`.agile-v/POLICY.yaml`](.agile-v/POLICY.yaml) — frozen paths, gates

## On task start

5. [`.agile-v/REQUIREMENTS.md`](.agile-v/REQUIREMENTS.md) — map request → `REQ-XXXX`
6. [`.agile-v/BACKLOG.md`](.agile-v/BACKLOG.md) — pick `BL-XXXX`
7. [`Docs/project-idea/PROJECT_WALKTHROUGH.md`](Docs/project-idea/PROJECT_WALKTHROUGH.md)

## Agile V skills (load on demand)

| Trigger | Skill |
|---|---|
| **Every session** | `agile-v-core` |
| Pipeline / stages | `agile-v-pipeline` |
| CR / cycle boundary | `agile-v-lifecycle` |
| Gates / risk / CAPA | `agile-v-compliance` |
| Quality checks | `agile-v-quality-gates` |
| Backlog / sprint | `agile-v-product-owner` |
| New REQs | `requirement-architect` |
| Stage 2 | `logic-gatekeeper` |
| Hydrogen / React | `build-agent-js` |
| Tests | `test-designer` |
| Independent verify | `red-team-verifier` |
| ATM / audit | `compliance-auditor` |
| Discovery | `discovery-analyst` |
| UX specs | `ux-spec-author` |
| Security | `threat-modeler` |
| Observability | `observability-planner` |
| Release | `release-manager` |

## Infinity Loop (summary)

Specify → Constrain → Orchestrate → Prove → Evolve → Verify

On code change: append `DECISION_LOG.md`, update `BUILD_MANIFEST.md`, `STATE.md`.

## Project rules

- React Router 7 — [`.cursor/rules/hydrogen-react-router.mdc`](.cursor/rules/hydrogen-react-router.mdc)
- Header stack sync: see `config.json` → `header_stack_sync_points`
- REQ-0001 design tokens frozen unless approved
- Git: `development` on `zaman365/zehn-hydrogen-frontend-clean`

## Verify before done

```bash
npm run typecheck
npx vitest run
```

Visual: 390, 1280, 1440, 1920px for UI work.
