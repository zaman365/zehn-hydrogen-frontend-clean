# AGENTS.md — ZEHN Hydrogen Frontend

<!-- Agent load order for Cursor / Claude sessions -->

## Always first

1. [`CLAUDE.md`](CLAUDE.md) — session resume (what we left off, where to start)
2. [`.agile-v/STATE.md`](.agile-v/STATE.md)
3. [`.agile-v/PLAYBOOK.md`](.agile-v/PLAYBOOK.md)
4. [`.agile-v/POLICY.yaml`](.agile-v/POLICY.yaml)

## On task start

5. [`.agile-v/REQUIREMENTS.md`](.agile-v/REQUIREMENTS.md) — map user request → `REQ-XXXX`
6. [`.agile-v/BACKLOG.md`](.agile-v/BACKLOG.md) — pick `BL-XXXX`
7. [`Docs/project-idea/PROJECT_WALKTHROUGH.md`](Docs/project-idea/PROJECT_WALKTHROUGH.md)

## Skills (Agile V)

| Trigger | Skill |
|---|---|
| Every session | `agile-v-core` |
| Pipeline / stages | `agile-v-pipeline` |
| CR / cycle boundary | `agile-v-lifecycle` |
| Gates / risk / CAPA | `agile-v-compliance` |
| Quality checks | `agile-v-quality-gates` |
| Backlog / sprint | `agile-v-product-owner` |
| New REQs | `requirement-architect` |
| Stage 2 | `logic-gatekeeper` |
| Hydrogen / React code | `build-agent-js` |
| Tests | `test-designer` |
| Independent verify | `red-team-verifier` |

## Project rules

- React Router 7 — see [`.cursor/rules/hydrogen-react-router.mdc`](.cursor/rules/hydrogen-react-router.mdc)
- Frozen: REQ-0004 header stack, REQ-0001 design tokens (unless approved)
- Log changes: `.agile-v/DECISION_LOG.md`, `.agile-v/BUILD_MANIFEST.md`

## Verify before done

```bash
npm run typecheck
npx vitest run
```

Visual: 390px, 1280px, 1440px for UI work.
