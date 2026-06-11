import type { Severity } from './semantic.js';

export interface ApidiffConfig {
  failOn: 'breaking' | 'warning';
  ignorePaths: string[];
  ruleSeverityOverrides: Record<string, Severity>;
  disabledRules: string[];
  customRules: string[];
  output: OutputConfig;
}

export interface OutputConfig {
  format: 'terminal' | 'json' | 'markdown' | 'html';
  color: boolean;
  summary: boolean;
  quiet: boolean;
}

export const DEFAULT_CONFIG: ApidiffConfig = {
  failOn: 'breaking',
  ignorePaths: [],
  ruleSeverityOverrides: {},
  disabledRules: [],
  customRules: [],
  output: {
    format: 'terminal',
    color: true,
    summary: false,
    quiet: false,
  }
};
