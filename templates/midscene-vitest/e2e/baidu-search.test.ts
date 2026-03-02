import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { TestContext } from '../src/context';

describe('百度搜索', () => {
  let ctx: TestContext;

  beforeAll(() => TestContext.setup());
  afterEach((testCtx) => TestContext.collectReport(ctx, testCtx));
  afterAll((suite) => TestContext.mergeAndTeardown(suite));

  it('应该成功搜索', async () => {
    ctx = await TestContext.create('https://baidu.com');
    await ctx.agent.aiAct('在搜索框中输入"新年快乐"，然后点击百度一下');
    await ctx.page.waitForLoadState('networkidle');
    const title = await ctx.page.title();
    expect(title).toContain('新年快乐');
  });

  it('应该能切换搜索词', async () => {
    ctx = await TestContext.create('https://baidu.com');
    await ctx.agent.aiAct('在搜索框中输入"Midscene"，然后点击百度一下');
    await ctx.page.waitForLoadState('networkidle');
    const title = await ctx.page.title();
    expect(title).toContain('Midscene');
  });

  it.skip('应该能打开百度首页', async () => {
    ctx = await TestContext.create('https://baidu.com');
    await ctx.page.waitForLoadState('networkidle');
    const title = await ctx.page.title();
    expect(title).toContain('百度');
  });
});
