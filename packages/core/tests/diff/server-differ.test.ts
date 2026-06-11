import { describe, it, expect } from 'vitest';
import { diffServers } from '../../src/diff/server-differ.js';
import type { Server } from '../../src/types/index.js';

describe('Server Differ', () => {
  it('detects added servers', () => {
    const oldServers: Server[] = [];
    const newServers: Server[] = [{ url: 'http://test.com', description: '' }];
    const diffs = diffServers(oldServers, newServers);
    expect(diffs).toHaveLength(1);
    expect(diffs[0].changeType).toBe('added');
    expect(diffs[0].newServer?.url).toBe('http://test.com');
  });

  it('detects removed servers', () => {
    const oldServers: Server[] = [{ url: 'http://test.com', description: '' }];
    const newServers: Server[] = [];
    const diffs = diffServers(oldServers, newServers);
    expect(diffs).toHaveLength(1);
    expect(diffs[0].changeType).toBe('removed');
    expect(diffs[0].oldServer?.url).toBe('http://test.com');
  });
});
