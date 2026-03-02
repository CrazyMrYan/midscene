# Midscene + Vitest Template

## Tech Stack

- **Test Runner**: Vitest
- **Browser Automation**: Playwright (chromium)
- **AI-driven Testing**: @midscene/web (PlaywrightAgent)
- **Language**: TypeScript (ESM)

## Project Structure

```
├── e2e/                        # Test files
│   └── baidu-search.test.ts
├── src/
│   └── context.ts              # TestContext class
├── skills/                     # AI Agent skill
│   ├── SKILL.md                # Entry point with frontmatter
│   ├── metadata.json
│   ├── install.sh              # Skill installer
│   └── references/
│       ├── apis/               # API references by tool
│       │   ├── midscene-api.md
│       │   ├── vitest-api.md
│       │   └── playwright-api.md
│       ├── test-template.md
│       ├── test-case-operations.md
│       └── troubleshooting.md
├── vitest.config.ts
├── tsconfig.json
├── package.json
└── .env.example
```

## Key Patterns

- Test files import `TestContext` from `src/context.ts` — do NOT instantiate browser/agent directly
- `TestContext.setup()` in `beforeAll` launches a shared browser; `TestContext.create(url)` in each `it` creates an independent page + agent
- Each `it` block gets its own agent with its own report file
- `ReportMergingTool` (from `@midscene/core/report`) collects individual reports in `afterEach` and merges them in `afterAll` with pass/failed/skipped status
- `ctx.agent` provides AI-driven methods: `aiTap`, `aiInput`, `aiAssert`, `aiQuery`, `aiWaitFor`, `aiAct`
- `ctx.page` is a standard Playwright Page for native APIs

## Skill — Write Test Cases Faster

This project includes a built-in `midscene-test` skill that helps you rapidly create, update, and debug E2E test cases. The skill bundles complete API references, test templates, and troubleshooting guides so you can produce tests efficiently without memorizing API details.

### Auto-Install & Load

**On first use, you MUST run the install command to deploy the skill into the AI tool's directory:**

```bash
npm run skill:install
```

Once installed, the skill is copied to the appropriate tool directory (e.g., `.claude/skills/midscene-vitest/` for Claude Code) and will be auto-loaded in subsequent sessions.

### Skill Capabilities

- **Create tests**: Generate spec-compliant test files from a feature description
- **Update tests**: Modify existing test cases, add new scenarios
- **Debug tests**: Diagnose test failures and suggest fixes

### Reference Docs

The skill entry point is `skills/SKILL.md`, which links to:

| Document | Impact | Description |
|----------|--------|-------------|
| `references/apis/midscene-api.md` | **CRITICAL** | Midscene Agent API (`aiTap`, `aiInput`, `aiAssert`, etc.) |
| `references/apis/vitest-api.md` | MEDIUM | Vitest API quick reference |
| `references/apis/playwright-api.md` | MEDIUM | Playwright Page API quick reference |
| `references/test-template.md` | **CRITICAL** | Test structure, lifecycle & scaffolding template |
| `references/test-case-operations.md` | HIGH | Create / update / run test case workflows |
| `references/troubleshooting.md` | HIGH | Common issues & solutions |

## Commands

```bash
npx vitest run              # Run all tests
npx vitest run e2e/file.ts  # Run specific test
npx vitest --ui             # Run with UI
npm run skill:install       # Install AI skill
```

## Environment

Copy `.env.example` to `.env` and fill in your API keys before running tests.
