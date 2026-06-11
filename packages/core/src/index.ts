import type { ApidiffConfig, RunResult, SemanticChange } from './types/index.js';
import { loadSpec } from './loader/index.js';
import { parseSpec } from './parsers/index.js';
import { computeDiff } from './diff/index.js';
import { runRules } from './rules/index.js';
import { DEFAULT_CONFIG } from './config/index.js';

export * from './types/index.js';
export { loadConfig } from './config/index.js';
export { formatOutput } from './output/index.js';

/**
 * Runs the semantic API diffing process between two specifications.
 * 
 * @param oldSource - The path, URL, git ref, or raw string of the base specification
 * @param newSource - The path, URL, git ref, or raw string of the head specification
 * @param config - Optional configuration to override default rules and output settings
 * @returns A promise that resolves to the RunResult containing the changes and statistics
 */
export async function runContent(
  oldContent: string,
  newContent: string,
  config: Partial<ApidiffConfig> = {}
): Promise<RunResult> {
  const fullConfig = { ...DEFAULT_CONFIG, ...config } as ApidiffConfig;
  const startMs = Date.now();

  const [oldAST, newAST] = await Promise.all([
    parseSpec({ content: oldContent }),
    parseSpec({ content: newContent }),
  ]);

  const diffSet = computeDiff(oldAST, newAST);
  const allChanges = runRules(diffSet, { oldAST, newAST, config: fullConfig });
  const changes = filterChanges(allChanges, fullConfig);

  return {
    changes,
    stats: computeStats(changes),
    oldSpecMeta: oldAST.meta,
    newSpecMeta: newAST.meta,
    durationMs: Date.now() - startMs,
  };
}

export async function run(
  oldSource: string,
  newSource: string,
  config: Partial<ApidiffConfig> = {}
): Promise<RunResult> {
  const fullConfig = { ...DEFAULT_CONFIG, ...config } as ApidiffConfig;
  const startMs = Date.now();

  const [oldRaw, newRaw] = await Promise.all([
    loadSpec(oldSource),
    loadSpec(newSource),
  ]);

  const [oldAST, newAST] = await Promise.all([
    parseSpec(oldRaw),
    parseSpec(newRaw),
  ]);

  const diffSet = computeDiff(oldAST, newAST);

  const allChanges = runRules(diffSet, { oldAST, newAST, config: fullConfig });

  const changes = filterChanges(allChanges, fullConfig);

  return {
    changes,
    stats: computeStats(changes),
    oldSpecMeta: oldAST.meta,
    newSpecMeta: newAST.meta,
    durationMs: Date.now() - startMs,
  };
}

function filterChanges(changes: SemanticChange[], config: ApidiffConfig): SemanticChange[] {
  return changes;
}

function computeStats(changes: SemanticChange[]) {
  const stats = { breaking: 0, warning: 0, info: 0, total: 0 };
  for (const c of changes) {
    if (c.severity === 'breaking') stats.breaking++;
    else if (c.severity === 'warning') stats.warning++;
    else stats.info++;
    stats.total++;
  }
  return stats;
}
