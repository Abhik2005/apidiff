import { describe, it, expect, vi } from 'vitest';
import * as fs from 'node:fs';
import { resolve } from 'node:path';
import { loadSpec } from '../src/loader/index.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

vi.mock('node:fs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:fs')>();
  return {
    ...actual,
    readFileSync: vi.fn(actual.readFileSync)
  };
});

describe('Loader', () => {
  it('loads valid file', async () => {
    // Assuming integration.test.ts has valid files we can load
    const doc = await loadSpec(path.join(__dirname, '../test/integration/stripe-v1.yaml'));
    expect(doc).toBeDefined();
  });

  it('throws on invalid file', async () => {
    await expect(loadSpec('does-not-exist.yaml')).rejects.toThrow();
  });

  it('throws EACCES on permission denied', async () => {
    vi.mocked(fs.readFileSync).mockImplementationOnce(() => {
      const err = new Error('EACCES');
      (err as any).code = 'EACCES';
      throw err;
    });
    
    await expect(loadSpec('dummy.yaml')).rejects.toThrow('permission denied');
  });

  it('throws on generic file error', async () => {
    vi.mocked(fs.readFileSync).mockImplementationOnce(() => {
      const err = new Error('Generic error');
      throw err;
    });
    
    await expect(loadSpec('dummy.yaml')).rejects.toThrow('failed to read file');
  });

  it('reads from stdin', async () => {
    vi.mocked(fs.readFileSync).mockReturnValueOnce('mock_stdin_content');
    const doc = await loadSpec('-');
    expect(doc.content).toBe('mock_stdin_content');
    expect(fs.readFileSync).toHaveBeenCalledWith(0, 'utf-8');
  });

  it('throws on stdin error', async () => {
    vi.mocked(fs.readFileSync).mockImplementationOnce(() => {
      throw new Error('stdin error');
    });
    await expect(loadSpec('-')).rejects.toThrow('failed to read from stdin');
  });
});
