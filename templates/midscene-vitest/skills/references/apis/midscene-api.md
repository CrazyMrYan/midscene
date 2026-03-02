---
title: Midscene Agent API
impact: CRITICAL
tags: midscene, agent, ai, api, core
---

# Midscene Agent API

`ctx.agent` is a `PlaywrightAgent` instance from `@midscene/web/playwright`. All methods return Promises.

## High-Frequency APIs

### aiTap(locatePrompt, opt?)

Click an element described in natural language.

```typescript
await ctx.agent.aiTap('登录按钮');
await ctx.agent.aiTap('the Submit button');
```

### aiInput(locatePrompt, { value, mode? })

Type text into an input element. First argument describes WHERE, second provides WHAT.

```typescript
await ctx.agent.aiInput('用户名输入框', { value: 'admin' });
await ctx.agent.aiInput('search box', { value: 'hello', mode: 'append' });
```

> `mode` options: `'replace'` (default) | `'clear'` | `'typeOnly'` | `'append'`

### aiAssert(assertion, msg?)

Assert a condition in natural language. Throws if the assertion fails.

```typescript
await ctx.agent.aiAssert('页面上显示了"登录成功"');
await ctx.agent.aiAssert('the error message is visible');
```

### aiQuery\<T\>(demand)

Extract structured data from the page using natural language.

```typescript
const titles = await ctx.agent.aiQuery<string[]>('获取搜索结果列表的标题');
```

### aiWaitFor(condition, { timeout? })

Wait until a condition is met.

```typescript
await ctx.agent.aiWaitFor('页面加载完成并显示了商品列表');
await ctx.agent.aiWaitFor('loading spinner disappears', { timeout: 10000 });
```

### aiAct(taskPrompt, opt?) — Preferred for UI Operations

**`aiAct` is the preferred API for UI operations.** It accepts natural language instructions and autonomously plans and executes multi-step interactions. Always prefer `aiAct` over manually chaining `aiTap`/`aiInput` unless you need fine-grained control over individual steps.

```typescript
await ctx.agent.aiAct('在搜索框中输入"iPhone"，然后点击搜索按钮');
await ctx.agent.aiAct('hover over the user avatar in the top right');
```

**Phase splitting:** If the task prompt is too long or covers multiple distinct stages, split it into separate `aiAct` calls — one per phase. Each phase should be a self-contained logical step, and all phases combined must match the user's original intent.

```typescript
// Incorrect — prompt spans multiple pages and too many steps, AI may lose context mid-way
await ctx.agent.aiAct('点击顶部导航栏的设置按钮，进入设置页面，找到个人信息选项并点击进入，将邮箱修改为"test@example.com"，将手机号修改为"13800000000"，点击保存按钮，等待保存成功');

// Correct — split by page/stage boundary, each phase stays within one logical context
await ctx.agent.aiAct('点击顶部导航栏的设置按钮，进入设置页面，找到个人信息选项并点击进入');
await ctx.agent.aiAct('将邮箱修改为"test@example.com"，将手机号修改为"13800000000"，点击保存按钮');
await ctx.agent.aiWaitFor('保存成功提示出现');
```

> `aiAction` is deprecated. Use `aiAct` or `ai` instead.

## Common Mistakes

**Vague locator descriptions:**

```typescript
// Incorrect — too vague, may match wrong element
await ctx.agent.aiTap('按钮');
await ctx.agent.aiInput('输入框', { value: 'test' });

// Correct — specific context helps AI locate precisely
await ctx.agent.aiTap('页面顶部的蓝色"提交"按钮');
await ctx.agent.aiInput('用户名输入框', { value: 'test' });
```

**Missing network wait after navigation:**

```typescript
// Incorrect — assertion may run before page loads
await ctx.agent.aiTap('提交按钮');
await ctx.agent.aiAssert('提交成功');

// Correct — wait for network to settle first
await ctx.agent.aiTap('提交按钮');
await ctx.page.waitForLoadState('networkidle');
await ctx.agent.aiAssert('提交成功');
```

**Using deprecated aiAction:**

```typescript
// Incorrect — deprecated
await ctx.agent.aiAction('scroll down');

// Correct — use aiAct
await ctx.agent.aiAct('scroll down');
```

**Ambiguous multi-element targets:**

```typescript
// Incorrect — which delete button?
await ctx.agent.aiTap('删除按钮');

// Correct — specify which one
await ctx.agent.aiTap('第一行商品的删除按钮');
```

## Other Available APIs

| Method | Description |
|--------|-------------|
| `aiHover(locatePrompt)` | Hover over an element |
| `aiDoubleClick(locatePrompt)` | Double-click an element |
| `aiRightClick(locatePrompt)` | Right-click an element |
| `aiScroll(locatePrompt, { direction, scrollType })` | Scroll at a specified element |
| `aiKeyboardPress(locatePrompt, { keyName })` | Press a key on a focused element |
| `aiLocate(prompt)` | Locate an element, returns `{ rect, center }` |
| `aiBoolean(prompt)` | Extract a boolean from the page |
| `aiNumber(prompt)` | Extract a number from the page |
| `aiString(prompt)` | Extract a string from the page |
| `aiAsk(prompt)` | Ask a free-form question about the page |
| `runYaml(yamlScript)` | Run a YAML automation script |
| `evaluateJavaScript(script)` | Execute JavaScript in the page context |
| `waitForNetworkIdle(timeout?)` | Wait for network activity to settle |
| `destroy()` | Release agent resources |

## How to Look Up More

1. Download https://midscenejs.com/llms.txt, then use `grep` to search for the API or concept you need (the file is large, do not read it in full)
2. In `node_modules/@midscene/web` and `node_modules/@midscene/core`, find the type definitions for `PlaywrightAgent` and `Agent`, read the signatures first
3. If types are not enough, follow the source references in the `.d.ts` files to read the implementation code in `node_modules`
