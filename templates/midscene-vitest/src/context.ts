import { chromium, type Browser, type Page } from 'playwright';
import { PlaywrightAgent } from '@midscene/web/playwright';
import { ReportMergingTool } from '@midscene/core/report';
import type { TestStatus } from '@midscene/core';
import type { TaskMeta } from 'vitest';

const DEFAULT_ARGS = ['--no-sandbox', '--ignore-certificate-errors'];

export interface TestContextOptions {
  viewport?: { width: number; height: number };
  headless?: boolean;
}

export class TestContext {
  private static sharedBrowser: Browser | null = null;
  private static sharedOptions: TestContextOptions = {};
  private static reportTool = new ReportMergingTool();
  private static individualReports: string[] = [];

  page: Page;
  agent: PlaywrightAgent;
  private _reportFile: string | null | undefined;
  private startTime: number;

  private constructor(page: Page, agent: PlaywrightAgent) {
    this.page = page;
    this.agent = agent;
    this.startTime = performance.now();
  }

  /**
   * Initialize the shared browser instance. Call once in `beforeAll`.
   */
  static async setup(options?: TestContextOptions): Promise<void> {
    TestContext.sharedOptions = options ?? {};
    TestContext.sharedBrowser = await chromium.launch({
      headless: options?.headless ?? true,
      args: DEFAULT_ARGS,
    });
    TestContext.reportTool = new ReportMergingTool();
  }

  /**
   * Create a new page + agent on the shared browser. Call in each `it` block.
   * Each call produces an independent agent with its own report file.
   */
  static async create(
    url: string,
    options?: TestContextOptions,
  ): Promise<TestContext> {
    if (!TestContext.sharedBrowser) {
      await TestContext.setup(options);
    }
    const opts = { ...TestContext.sharedOptions, ...options };
    const page = await TestContext.sharedBrowser!.newPage({
      viewport: opts.viewport ?? { width: 1920, height: 1080 },
    });
    await page.goto(url);
    const agent = new PlaywrightAgent(page);
    return new TestContext(page, agent);
  }

  /**
   * The path to this agent's individual report file.
   * Available after any AI action, or after `destroy()` (which finalizes the report).
   */
  get reportFile(): string | null | undefined {
    return this._reportFile ?? this.agent.reportFile;
  }

  /**
   * Close this page and release agent resources.
   * Caches reportFile before teardown so it remains accessible after destroy.
   */
  async destroy(): Promise<void> {
    await this.agent.destroy();
    this._reportFile = this.agent.reportFile;
    await this.page.close();
  }

  /**
   * Collect report for a completed test. Call in `afterEach`.
   * Destroys the context and appends test result to the report tool.
   *
   * Uses structural typing for the vitest test context to avoid importing vitest in this module.
   */
  static async collectReport(
    ctx: TestContext | undefined,
    testCtx: {
      task: {
        id: string;
        name: string;
        suite?: { name: string };
        result?: {
          state?: string;
          errors?: Array<{ message: string }>;
        };
      };
    },
  ): Promise<void> {
    let status: TestStatus = 'passed';
    if (testCtx.task.result?.state === 'pass') {
      status = 'passed';
    } else if (
      testCtx.task.result?.errors?.[0]?.message.includes('timed out')
    ) {
      status = 'timedOut';
    } else if (testCtx.task.result?.state === 'fail') {
      status = 'failed';
    }

    await ctx?.destroy();

    const description = `E2E: ${testCtx.task.suite?.name ? `${testCtx.task.suite.name}-` : ''}${testCtx.task.name}`;

    const reportFile = ctx?.reportFile ?? undefined;

    TestContext.reportTool.append({
      reportFilePath: reportFile,
      reportAttributes: {
        testId: testCtx.task.id,
        testTitle: testCtx.task.name,
        testDescription: description,
        testDuration: ctx
          ? Math.round(performance.now() - ctx.startTime)
          : 0,
        testStatus: status,
      },
    });

    if (reportFile) {
      TestContext.individualReports.push(reportFile);
    }
  }

  /**
   * Merge all collected reports and tear down the browser. Call in `afterAll`.
   * Automatically appends skipped tests (vitest does NOT run afterEach for it.skip).
   *
   * @param suite - The vitest suite object (structural typing to avoid vitest import)
   * @param reportName - Base name for the merged report file (timestamp is appended automatically)
   */
  static async mergeAndTeardown(
    suite: {
      name: string;
      tasks: Array<{ id: string; name: string; mode: string }>;
      meta?: TaskMeta;
    },
    reportName?: string,
  ): Promise<string | null> {
    const finalReportName = (reportName ?? suite.name) || 'MergedReport';
    for (const task of suite.tasks) {
      if (task.mode === 'skip') {
        TestContext.reportTool.append({
          reportAttributes: {
            testId: task.id,
            testTitle: task.name,
            testDescription: `E2E: ${suite.name ? `${suite.name}-` : ''}${task.name}`,
            testDuration: 0,
            testStatus: 'skipped',
          },
        });
      }
    }

    const now = new Date();
    const timestamp = [
      String(now.getFullYear()),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0'),
      '-',
      String(now.getHours()).padStart(2, '0'),
      String(now.getMinutes()).padStart(2, '0'),
      String(now.getSeconds()).padStart(2, '0'),
      String(now.getMilliseconds()).padStart(3, '0'),
    ].join('');
    const merged = TestContext.reportTool.mergeReports(
      `${finalReportName}-${timestamp}`,
    );

    const report = merged ?? TestContext.individualReports[0] ?? null;
    if (report && suite.meta) {
      suite.meta.midsceneReport = report;
    }

    TestContext.individualReports = [];
    await TestContext.teardown();
    return merged;
  }

  /**
   * Close the shared browser. Call once in `afterAll`.
   */
  static async teardown(): Promise<void> {
    await TestContext.sharedBrowser?.close();
    TestContext.sharedBrowser = null;
  }
}
