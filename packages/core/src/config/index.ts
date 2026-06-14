import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import type { ApidiffConfig } from '../types/index.js';

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
    quiet: false
  }
};

export async function loadConfig(options: { config?: string, format?: string, failOn?: string, ignorePath?: string[] }): Promise<ApidiffConfig> {
  let config = { ...DEFAULT_CONFIG, output: { ...DEFAULT_CONFIG.output } };
  
  let configPath: string | undefined;

  if (options.config) {
    configPath = resolve(process.cwd(), options.config);
  } else {
    // Auto-discover config file in cwd
    const defaultPath = resolve(process.cwd(), 'apidiff.config.json');
    if (existsSync(defaultPath)) {
      configPath = defaultPath;
    }
  }

  if (configPath) {
    if (existsSync(configPath)) {
      const fileContent = readFileSync(configPath, 'utf8');
      try {
        const fileConfig = JSON.parse(fileContent);
        config = { ...config, ...fileConfig, output: { ...config.output, ...(fileConfig.output || {}) } };
      } catch (err) {
        throw new Error(`Failed to parse config file at ${configPath}`);
      }
    } else if (options.config) {
      throw new Error(`Config file not found at ${configPath}`);
    }
  }

  if (options.format) config.output.format = options.format as any;
  if (options.failOn) config.failOn = options.failOn as any;
  if (options.ignorePath && options.ignorePath.length > 0) {
    config.ignorePaths = [...config.ignorePaths, ...options.ignorePath];
  }

  return config;
}
