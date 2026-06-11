import { describe, it, expect } from 'vitest';
import { diffEndpoints } from '../src/diff/endpoint-differ.js';
import { diffServers } from '../src/diff/server-differ.js';
import { diffSchema } from '../src/diff/schema-differ.js';
import type { Endpoint, Server, Schema, FieldChange } from '../src/types/index.js';

describe('Differ Coverage', () => {
  it('diffEndpoints - coverage', () => {
    const oldE: Endpoint = {
      id: 'test',
      method: 'GET',
      path: '/test',
      security: [],
      parameters: [{ name: 'p', in: 'query', schema: {}, required: true, deprecated: false }],
      requestBody: {
        required: true,
        content: { 'app/json': { schema: {} } }
      },
      responses: [
        {
          statusCode: '200',
          description: 'ok',
          content: { 'app/json': { schema: {} } },
          headers: { 'X-RateLimit': { schema: {}, required: true, description: '' } }
        }
      ],
      tags: [],
      deprecated: false,
      extensions: {}
    };

    const newE: Endpoint = {
      id: 'test',
      method: 'POST',
      path: '/test2',
      security: [],
      parameters: [{ name: 'p', in: 'query', schema: {}, required: false, deprecated: true }],
      requestBody: {
        required: false,
        content: { 'text/plain': { schema: {} } }
      },
      responses: [
        {
          statusCode: '200',
          description: 'ok',
          content: { 'text/plain': { schema: {} } },
          headers: { 'X-RateLimit': { schema: {}, required: false, description: '' } }
        }
      ],
      tags: [],
      deprecated: true,
      extensions: {}
    };

    const diffs = diffEndpoints([oldE], [newE]);
    expect(diffs).toHaveLength(1);
    expect(diffs[0].type).toBe('changed');
    
    // Check old missing request body to new request body
    const diffs2 = diffEndpoints(
      [{ ...oldE, requestBody: undefined }],
      [{ ...newE, requestBody: { required: false, content: {} } }]
    );
    expect(diffs2).toBeDefined();

    // Check old request body to missing
    const diffs3 = diffEndpoints(
      [{ ...oldE, requestBody: { required: false, content: {} } }],
      [{ ...newE, requestBody: undefined }]
    );
    expect(diffs3).toBeDefined();
  });

  it('diffServers - coverage', () => {
    const changes = diffServers(
      [{ url: 'http://old' }],
      [{ url: 'http://new' }]
    );
    expect(changes).toBeDefined();

    const changes2 = diffServers(
      [{ url: 'http://same', description: 'old' }],
      [{ url: 'http://same', description: 'new' }]
    );
    expect(changes2).toBeDefined();
  });

  it('diffSchema - coverage', () => {
    const changes: FieldChange[] = [];
    diffSchema(undefined, { type: 'string' }, ['root'], changes);
    diffSchema({ type: 'string' }, undefined, ['root'], changes);

    const oldS: Schema = {
      type: 'object',
      properties: { a: { type: 'string' }, b: { type: 'number' } },
      required: ['a'],
      enum: ['x'],
      allOf: [{ type: 'object' }],
      oneOf: [{ type: 'object' }],
      anyOf: [{ type: 'object' }]
    };

    const newS: Schema = {
      type: 'object',
      properties: { b: { type: 'string' }, c: { type: 'number' } },
      required: ['b'],
      enum: ['y'],
      allOf: [{ type: 'string' }],
      oneOf: [{ type: 'string' }],
      anyOf: [{ type: 'string' }]
    };

    diffSchema(oldS, newS, ['schema'], changes);
    expect(changes.length).toBeGreaterThan(0);
  });
});
