import { describe, it, expect } from 'vitest';
import { parseSpec } from '../src/parsers/index.js';
import { semanticHash } from '../src/ast/hash.js';

describe('Phase 1: AST and Parsing', () => {
  it('should parse and hash basic OpenAPI spec', async () => {
    const raw = {
      content: JSON.stringify({
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0' },
        paths: {
          '/test': {
            get: {
              operationId: 'getTest',
              responses: {
                '200': { description: 'OK' }
              }
            }
          }
        }
      }),
      format: 'openapi3' as const
    };
    
    const ast = await parseSpec(raw);
    expect(ast.meta.title).toBe('Test API');
    expect(ast.endpoints).toHaveLength(1);
    expect(ast.endpoints[0].id).toBe('GET:/test');
    
    const hash = semanticHash(ast);
    expect(typeof hash).toBe('string');
    expect(hash.length).toBeGreaterThan(0);
  });

  it('hashes consistently', () => {
    const a = semanticHash({ a: 1, b: 2 });
    const b = semanticHash({ b: 2, a: 1 });
    expect(a).toBe(b);
  });

  it('handles null and undefined', () => {
    const a = semanticHash(null);
    const b = semanticHash(undefined);
    expect(a).toBe(b); // both should return semantic hash of null
  });

  it('handles arrays', () => {
    const a = semanticHash([1, 2, 3]);
    const b = semanticHash([1, 2, 3]);
    expect(a).toBe(b);
    const c = semanticHash([3, 2, 1]);
    expect(a).not.toBe(c);
  });

  it('handles primitive values', () => {
    const a = semanticHash('test');
    const b = semanticHash('test');
    expect(a).toBe(b);
  });
});
