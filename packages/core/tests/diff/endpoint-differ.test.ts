import { describe, it, expect } from 'vitest';
import { diffEndpoints } from '../../src/diff/endpoint-differ.js';
import type { Endpoint } from '../../src/types/index.js';

describe('Endpoint Differ', () => {
  it('detects added endpoint', () => {
    const oldEndpoints: Endpoint[] = [];
    const newEndpoints: Endpoint[] = [{ id: 'GET:/', path: '/', method: 'GET', summary: '', description: '', tags: [], deprecated: false, security: [], parameters: [], responses: [] }];
    const diffs = diffEndpoints(oldEndpoints, newEndpoints);
    expect(diffs).toHaveLength(1);
    expect(diffs[0].type).toBe('added');
    expect(diffs[0].endpointId).toBe('GET:/');
  });

  it('detects removed endpoint', () => {
    const oldEndpoints: Endpoint[] = [{ id: 'GET:/', path: '/', method: 'GET', summary: '', description: '', tags: [], deprecated: false, security: [], parameters: [], responses: [] }];
    const newEndpoints: Endpoint[] = [];
    const diffs = diffEndpoints(oldEndpoints, newEndpoints);
    expect(diffs).toHaveLength(1);
    expect(diffs[0].type).toBe('removed');
  });

  it('detects changed endpoint fields', () => {
    const oldEndpoints: Endpoint[] = [{ id: 'GET:/', path: '/', method: 'GET', summary: '', description: '', tags: [], deprecated: false, security: [], parameters: [], responses: [] }];
    const newEndpoints: Endpoint[] = [{ id: 'GET:/', path: '/', method: 'GET', summary: 'new', description: '', tags: [], deprecated: true, security: [], parameters: [], responses: [] }];
    const diffs = diffEndpoints(oldEndpoints, newEndpoints);
    expect(diffs).toHaveLength(1);
    expect(diffs[0].type).toBe('changed');
    expect(diffs[0].fieldChanges).toContainEqual({ fieldPath: ['deprecated'], changeType: 'changed', oldValue: false, newValue: true });
  });

  it('diffs parameters', () => {
    const oldEndpoints: Endpoint[] = [{ id: 'GET:/', path: '/', method: 'GET', summary: '', description: '', tags: [], deprecated: false, security: [], parameters: [
      { name: 'p1', in: 'query', required: false }
    ], responses: [] }];
    const newEndpoints: Endpoint[] = [{ id: 'GET:/', path: '/', method: 'GET', summary: '', description: '', tags: [], deprecated: false, security: [], parameters: [
      { name: 'p1', in: 'query', required: true }
    ], responses: [] }];
    const diffs = diffEndpoints(oldEndpoints, newEndpoints);
    expect(diffs[0].fieldChanges).toContainEqual({ fieldPath: ['parameters', 'p1:query', 'required'], changeType: 'changed', oldValue: false, newValue: true });
  });
});
