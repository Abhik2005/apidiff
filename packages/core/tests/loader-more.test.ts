import { describe, it, expect, vi } from 'vitest';
import { loadGit } from '../src/loader/git-loader.js';
import { loadUrl } from '../src/loader/url-loader.js';
import { loadSpec } from '../src/loader/index.js';
import * as child_process from 'node:child_process';

vi.mock('node:child_process', () => ({
  execSync: vi.fn()
}));

global.fetch = vi.fn();

describe('More Loaders', () => {
  describe('git-loader', () => {
    it('throws on invalid source', () => {
      expect(() => loadGit('git:invalid')).toThrow('invalid git source format');
    });

    it('loads from git', () => {
      vi.mocked(child_process.execSync).mockReturnValueOnce('mock_content');
      const doc = loadGit('git:HEAD:file.yaml');
      expect(doc.content).toBe('mock_content');
    });

    it('throws on git error', () => {
      vi.mocked(child_process.execSync).mockImplementationOnce(() => {
        const err: any = new Error('Command failed');
        err.stderr = 'Not a valid object name';
        throw err;
      });
      expect(() => loadGit('git:HEAD:not-found.yaml')).toThrow('git ref or path not found');
    });
  });

  describe('url-loader', () => {
    it('loads from url', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        text: async () => 'mock_content'
      } as Response);
      const doc = await loadUrl('https://example.com/api.yaml');
      expect(doc.content).toBe('mock_content');
    });

    it('throws on http error', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 404
      } as Response);
      await expect(loadUrl('https://example.com/not-found.yaml')).rejects.toThrow('failed to fetch url');
    });

    it('throws on network error', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));
      await expect(loadUrl('https://example.com/api.yaml')).rejects.toThrow('network error fetching url');
    });
  });

  describe('index', () => {
    it('routes url', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        text: async () => 'mock_content'
      } as Response);
      const doc = await loadSpec('https://example.com/api.yaml');
      expect(doc.content).toBe('mock_content');
    });

    it('routes git', async () => {
      vi.mocked(child_process.execSync).mockReturnValueOnce('mock_content');
      const doc = await loadSpec('git:HEAD:file.yaml');
      expect(doc.content).toBe('mock_content');
    });
  });
});
