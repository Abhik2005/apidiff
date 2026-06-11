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
  
  if (options.config) {
    const configPath = resolve(process.cwd(), options.config);
    if (existsSync(configPath)) {
      const fileContent = readFileSync(configPath, 'utf8');
      try {
        const fileConfig = JSON.parse(fileContent);
        config = { ...config, ...fileConfig, output: { ...config.output, ...(fileConfig.output || {}) } };
      } catch (e) {
        throw new Error(`Failed to parse config file at ${configPath}`);
      }
    } else {
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
