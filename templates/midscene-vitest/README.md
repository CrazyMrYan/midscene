# Midscene + Vitest Template

A template project demonstrating how to use **Midscene + Vitest + Playwright** for AI-driven E2E testing. Write tests in natural language — no selectors needed.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env and fill in your OPENAI_API_KEY (or compatible model config)

# 3. Install AI skill (supports Claude Code, Trae, Codex)
npm run skill:install

# 4. Run tests
npm test
```

## Install Skill

The template ships with a `midscene-test` skill that guides AI agents to generate and manage E2E tests. Install it for your AI coding tool:

```bash
npm run skill:install          # Install for all tools
npm run skill:install:claude   # Claude Code only
npm run skill:install:trae     # Trae only
npm run skill:install:codex    # Codex only
```

After installation, invoke the skill via:
- **Claude Code**: `/midscene-test create login`
- **Trae**: reference `#midscene-test` in chat
- **Codex**: `/skills` or `$midscene-test` in prompt

## Project Structure

```
├── e2e/                            # Test files
│   └── baidu-search.test.ts        # Example: Baidu search test
├── src/
│   └── context.ts                  # TestContext class (browser/page/agent)
├── skills/                         # AI Agent skill
│   ├── SKILL.md                    # Skill entry point (frontmatter + overview)
│   ├── metadata.json               # Skill metadata
│   ├── install.sh                  # Skill installer for AI tools
│   └── references/
│       ├── apis/                   # API references by tool
│       │   ├── midscene-api.md
│       │   ├── vitest-api.md
│       │   └── playwright-api.md
│       ├── test-template.md        # Test structure, lifecycle & template
│       ├── test-case-operations.md # Create / update / delete workflows
│       └── troubleshooting.md      # Common issues & solutions
├── vitest.config.ts                # Vitest configuration
├── tsconfig.json                   # TypeScript configuration
├── .env.example                    # Environment variable template
└── package.json
```

## How It Works

Tests use `PlaywrightAgent` from `@midscene/web` to interact with web pages using natural language. Each test gets its own page + agent, and `ReportMergingTool` merges all individual reports with pass/failed/skipped status:

```typescript
import { describe, it, expect, beforeAll, beforeEach, afterEach, afterAll } from 'vitest';
import { ReportMergingTool } from '@midscene/core/report';
import { TestContext } from '../src/context';

describe('My Feature', () => {
  const reportMergingTool = new ReportMergingTool();
  let ctx: TestContext;
  let startTime: number;

  beforeAll(async () => { await TestContext.setup(); });
  beforeEach(() => { startTime = performance.now(); });

  afterEach(async (testCtx) => {
    let status = 'passed';
    if (testCtx.task.result?.state === 'pass') status = 'passed';
    else if (testCtx.task.result?.state === 'skip') status = 'skipped';
    else if (testCtx.task.result?.state === 'fail') status = 'failed';

    if (ctx?.reportFile) {
      reportMergingTool.append({
        reportFilePath: ctx.reportFile,
        reportAttributes: {
          testId: testCtx.task.id,
          testTitle: testCtx.task.name,
          testDescription: `E2E: ${testCtx.task.name}`,
          testDuration: Math.round(performance.now() - startTime),
          testStatus: status,
        },
      });
    }
    await ctx?.destroy();
  });

  afterAll(async () => {
    reportMergingTool.mergeReports('my-feature', { overwrite: true });
    await TestContext.teardown();
  });

  it('should do something', async () => {
    ctx = await TestContext.create('https://example.com');
    await ctx.agent.aiAct('click the Login button, enter "admin" in username field');
    await ctx.agent.aiAssert('login form is visible');
  });
});
```

## TestContext API

### `TestContext.setup(options?)`

Launch the shared browser. Call once in `beforeAll`.

| Parameter | Type | Description |
|-----------|------|-------------|
| `options.viewport` | `{ width, height }` | Viewport size (default: 1920x1080) |
| `options.headless` | `boolean` | Run headless (default: true) |

### `TestContext.create(url, options?)`

Create a new page + agent on the shared browser. Call in each `it` block.

| Parameter | Type | Description |
|-----------|------|-------------|
| `url` | `string` | Target URL to navigate to |
| `options.viewport` | `{ width, height }` | Override viewport for this page |

Returns a `TestContext` with `page`, `agent`, and `reportFile` properties.

### `ctx.destroy()`

Close the page and release agent resources.

### `TestContext.teardown()`

Close the shared browser. Call once in `afterAll`.

## Midscene Agent API

| Method | Description | Example |
|--------|-------------|---------|
| `aiTap(locator)` | Click an element | `agent.aiTap('Submit button')` |
| `aiInput(locator, { value })` | Type into an input | `agent.aiInput('search box', { value: 'test' })` |
| `aiAssert(condition)` | Assert a visual condition | `agent.aiAssert('shows success message')` |
| `aiQuery(query)` | Extract data from page | `agent.aiQuery('list of product names')` |
| `aiWaitFor(condition)` | Wait for a condition | `agent.aiWaitFor('loading complete')` |
| `aiAct(action)` | Perform a complex action | `agent.aiAct('scroll to bottom')` |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | API key for the AI model |
| `MIDSCENE_MODEL_NAME` | Model name (optional, for custom models) |
| `MIDSCENE_MODEL_BASE_URL` | Base URL (optional, for custom endpoints) |

## Scripts

```bash
npm test                       # Run all tests
npm run test:ui                # Run with Vitest UI
npm run skill:install          # Install AI skill for all tools
npm run skill:install:claude   # Install for Claude Code only
npm run skill:install:trae     # Install for Trae only
npm run skill:install:codex    # Install for Codex only
```
