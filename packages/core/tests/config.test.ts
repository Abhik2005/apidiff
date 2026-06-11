import { describe, it, expect, vi } from 'vitest';
import { loadConfig, DEFAULT_CONFIG } from '../src/config/index.js';
import * as fs from 'node:fs';

vi.mock('node:fs', () => ({
  readFileSync: vi.fn(),
  existsSync: vi.fn()
}));

describe('Config Loader', () => {
  it('returns default config', async () => {
    const config = await loadConfig({});
    expect(config).toEqual(DEFAULT_CONFIG);
  });

  it('loads from file', async () => {
    vi.mocked(fs.existsSync).mockReturnValueOnce(true);
    vi.mocked(fs.readFileSync).mockReturnValueOnce('{"failOn":"warning","output":{"format":"json"}}');
    const config = await loadConfig({ config: 'apidiff.json' });
    expect(config.failOn).toBe('warning');
    expect(config.output.format).toBe('json');
  });

  it('overrides with cli options', async () => {
    vi.mocked(fs.existsSync).mockReturnValueOnce(true);
    vi.mocked(fs.readFileSync).mockReturnValueOnce('{"failOn":"warning","output":{"format":"json"}}');
    const config = await loadConfig({ config: 'apidiff.json', format: 'markdown', failOn: 'info', ignorePath: ['/test'] });
    expect(config.failOn).toBe('info');
    expect(config.output.format).toBe('markdown');
    expect(config.ignorePaths).toContain('/test');
  });

  it('throws on not found', async () => {
    vi.mocked(fs.existsSync).mockReturnValueOnce(false);
    await expect(loadConfig({ config: 'does-not-exist.json' })).rejects.toThrow('Config file not found');
  });

  it('throws on invalid json', async () => {
    vi.mocked(fs.existsSync).mockReturnValueOnce(true);
    vi.mocked(fs.readFileSync).mockReturnValueOnce('invalid');
    await expect(loadConfig({ config: 'invalid.json' })).rejects.toThrow('Failed to parse config file');
  });
});
