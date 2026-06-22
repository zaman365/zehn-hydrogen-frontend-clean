# Test Specification — Cycle C1

<!-- TC linked to REQ — run via npx vitest run -->

| TC-ID | Cycle | REQ | Type | Command / path | Status |
|---|---|---|---|---|---|
| TC-0001 | C1 | REQ-0001 | unit | `app/__tests__/typography-smoke.test.ts` | baseline |
| TC-0002 | C1 | REQ-0001 | unit | `app/__tests__/typography-unit-components.test.ts` | baseline |
| TC-0003 | C1 | REQ-0001 | uat | `app/__tests__/typography-uat.test.ts` | baseline |
| TC-0004 | C1 | REQ-0002 | manual | No Remix imports in `app/` | pass |
| TC-0005 | C1 | REQ-0003 | manual | Visual: hero slides @ 390, 1280, 1440, 1920px | **PENDING sign-off** |
| TC-0006 | C1 | REQ-0003 | build | `npm run typecheck` | pass |
| TC-0007 | C1 | REQ-0005 | manual | Mobile layout spot-check key routes | pending |
| TC-0008 | C1 | REQ-0007 | manual | Homepage sections render in order | pass |

## REQ-0003 manual test script

1. Open `http://localhost:3000` — hard refresh
2. For each slider slide (wait 10s or advance):
   - 1920×1080: full model, Sommerseite visible, navbar 3px gap
   - 1440×900: heads below nav, feet above category row
   - 1280×800: same
   - 390×844: mobile head below navbar, full portrait
3. Click hero → scrolls below fold
4. Select SHORTS → products filter; subcategory pills appear

## Regression baseline

Run before Gate 2 acceptance:

```bash
npm run typecheck
npx vitest run
```
