import type { NormalizedAST, SpecMeta } from './ast.js';
import type { DiffSet } from './diff.js';
import type { ApidiffConfig } from './config.js';

export type Severity = 'breaking' | 'warning' | 'info';

export type RuleCategory =
  | 'endpoint'
  | 'parameter'
  | 'request-body'
  | 'response'
  | 'schema'
  | 'authentication'
  | 'deprecation'
  | 'server'
  | 'rate-limit';

export interface SemanticChange {
  ruleId: string;
  severity: Severity;
  category: RuleCategory;
  message: string;
  consequence: string;
  migration?: string;
  location: ChangeLocation;
}

export interface ChangeLocation {
  path?: string;
  method?: string;
  field?: string;
  statusCode?: string;
  paramName?: string;
}

export interface RunResult {
  changes: SemanticChange[];
  stats: {
    breaking: number;
    warning: number;
    info: number;
    total: number;
  };
  oldSpecMeta: SpecMeta;
  newSpecMeta: SpecMeta;
  durationMs: number;
}

export interface IRule {
  id: string;
  description: string;
  severity: Severity;
  apply(diff: DiffSet, context: RuleContext): SemanticChange[];
}

export interface RuleContext {
  oldAST: NormalizedAST;
  newAST: NormalizedAST;
  config: ApidiffConfig;
}
