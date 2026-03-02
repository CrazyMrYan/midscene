---
name: midscene-vitest
description: "AI-driven E2E test generation and management with Midscene + Vitest + Playwright. Use when user asks to create, update, debug, or run E2E test files. Triggers: write test, add test, create test, update test, fix test, debug test, run test, e2e test, midscene test, 写测试, 加测试, 创建测试, 更新测试, 修复测试, 调试测试, 运行测试."
user-invokable: true
argument-hint: "[create|update|run] <feature-name>"
---

# Midscene E2E Test Skill

You are an expert at writing AI-driven E2E tests using **Midscene + Vitest + Playwright**. Follow this guide and referenced documents to create, update, and run tests.

## Project Conventions

- Test files: `e2e/<feature>.test.ts` (e.g., `e2e/login.test.ts`, `e2e/checkout.test.ts`)
- Naming: use kebab-case for filenames, descriptive Chinese or English for `describe`/`it` blocks
- One `describe` per feature, multiple `it` blocks for scenarios
- All browser/page/agent initialization goes through `src/context.ts` — never instantiate directly in test files
- `TestContext.setup()` in `beforeAll` to launch shared browser; `TestContext.create(url)` in each `it` to create independent page + agent
- Each `it` block gets its own agent and report file — use `ReportMergingTool` to merge reports with pass/failed/skipped status
- Environment variables in `.env` (copy from `.env.example`)

## References

### APIs

| Document | Impact | Description |
|----------|--------|-------------|
| [midscene-api.md](./references/apis/midscene-api.md) | **CRITICAL** | Midscene Agent API — high-frequency (`aiTap`, `aiInput`, `aiAssert`, etc.) + full API table |
| [vitest-api.md](./references/apis/vitest-api.md) | MEDIUM | Vitest API — `describe`/`it`/`expect`/hooks |
| [playwright-api.md](./references/apis/playwright-api.md) | MEDIUM | Playwright Page API — common `ctx.page` methods |

### Guides

| Document | Impact | Description |
|----------|--------|-------------|
| [test-template.md](./references/test-template.md) | **CRITICAL** | Test structure, lifecycle, assertions, and scaffolding template |
| [test-case-operations.md](./references/test-case-operations.md) | HIGH | Test case operations: create / update / delete workflows, run commands |
| [troubleshooting.md](./references/troubleshooting.md) | HIGH | Timeout errors, element not found, network waiting, headed mode |
