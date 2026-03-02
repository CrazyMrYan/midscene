---
title: Test Structure & Template
impact: CRITICAL
tags: template, scaffolding, structure, lifecycle, report
---

# Test Structure & Template

## Structure

Each test file follows this pattern: shared browser via `TestContext.setup()`, per-test page + agent via `TestContext.create()`, report collecting and merging handled internally by `TestContext`.

```typescript
import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { TestContext } from '../src/context';

describe('<Feature Name>', () => {
  let ctx: TestContext;

  beforeAll(() => TestContext.setup());
  afterEach((testCtx) => TestContext.collectReport(ctx, testCtx));
  afterAll((suite) => TestContext.mergeAndTeardown(suite, '<feature-name>'));

  it('<scenario description>', async () => {
    ctx = await TestContext.create('<URL>');
    // Use ctx.agent for AI-driven interactions
    // Use ctx.page for Playwright native APIs
  });
});
```

## Lifecycle

- `beforeAll` — `TestContext.setup()` launches the shared browser (once per `describe`)
- Each `it` block — `TestContext.create(url)` opens a new page + agent (independent report per test, also starts duration timer)
- `afterEach` — `TestContext.collectReport(ctx, testCtx)` determines test status, destroys context, appends report (note: Vitest does NOT run `afterEach` for `it.skip` tests)
- `afterAll` — `TestContext.mergeAndTeardown(suite, name)` appends skipped tests, merges all reports into one HTML, then closes the shared browser

## Report Merging

`TestContext` manages `ReportMergingTool` internally:
- `collectReport` — called in `afterEach`, destroys context and appends test result
- `mergeAndTeardown` — called in `afterAll`, detects skipped tests from the suite, merges all reports, tears down browser

Key fields tracked per test:
- `testStatus` — `'passed'` | `'failed'` | `'timedOut'` | `'skipped'` | `'interrupted'`
- `testTitle` — test name from `it('name', ...)`
- `testDuration` — elapsed milliseconds (from `TestContext.create()` to `afterEach`)
- `testId` — unique test identifier

## Common Assertions

```typescript
expect(value).toBe(expected);           // strict equality
expect(value).toContain(substring);     // string/array contains
expect(value).toBeTruthy();             // truthy check
expect(value).toMatchObject(partial);   // partial object match
```

## Full Template

Use this template when creating new test files:

```typescript
import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { TestContext } from '../src/context';

describe('<FEATURE_NAME>', () => {
  let ctx: TestContext;

  beforeAll(() => TestContext.setup());
  afterEach((testCtx) => TestContext.collectReport(ctx, testCtx));
  afterAll((suite) => TestContext.mergeAndTeardown(suite, '<FEATURE_NAME>'));

  it('<SCENARIO_1>', async () => {
    ctx = await TestContext.create('<TARGET_URL>');

    // Step 1: interact
    await ctx.agent.aiAct('<describe the interaction>');

    // Step 2: wait for result
    await ctx.page.waitForLoadState('networkidle');

    // Step 3: verify
    await ctx.agent.aiAssert('<expected state>');
  });

  it('<SCENARIO_2>', async () => {
    ctx = await TestContext.create('<TARGET_URL>');
    // ...
  });
});
```
