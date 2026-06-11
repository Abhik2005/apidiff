import { describe, it, expect, vi } from 'vitest';
import { OpenApi3Parser } from '../../src/parsers/openapi3/index.js';
import { normalizeSchema } from '../../src/parsers/openapi3/schema-normalizer.js';
import { resolveRefs } from '../../src/parsers/openapi3/ref-resolver.js';
import * as fs from 'node:fs';

vi.mock('node:fs');

describe('OpenAPI 3 Coverage', () => {
  it('covers missing index.ts branches', async () => {
    const parser = new OpenApi3Parser();
    const ast = await parser.parse({
      content: JSON.stringify({
        openapi: '3.0.0',
        info: { version: '1' }, // Missing title
        paths: {
          '/test': {
            get: {
              'x-custom': 'ext',
              responses: {
                '200': {
                  description: 'ok',
                  content: { 'app/json': {} } // No schema, no headers
                }
              }
            }
          }
        }
      }),
      format: 'openapi3'
    });
    
    expect(ast.meta.title).toBe('Unknown API');
    expect(ast.endpoints[0].extensions['x-custom']).toBe('ext');
    expect(ast.endpoints[0].responses[0].headers).toEqual({});
  });

  it('covers ref-resolver external refs', () => {
    // mock readFileSync
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ type: 'string' }));
    
    const root = {
      prop: { $ref: './external.json' }
    };
    
    expect(() => resolveRefs({ ...root }, root)).toThrow('Cannot resolve relative ref without sourcePath');
    
    const resolved = resolveRefs(root, root, '/app/spec.json');
    expect(resolved.prop.type).toBe('string');
    
    expect(() => resolveRefs({ $ref: 'http://example.com' }, {}, '/app/spec.json')).toThrow('URL refs not implemented synchronously');
    expect(() => resolveRefs({ $ref: 'invalid-format' }, {}, '/app/spec.json')).toThrow('Unsupported ref format');
  });

  it('covers schema-normalizer missing branches', () => {
    // nullable string
    const s1 = normalizeSchema({ type: 'string', nullable: true });
    expect(s1.type).toEqual(['string', 'null']);

    // nullable array type
    const s2 = normalizeSchema({ type: ['string'], nullable: true });
    expect(s2.type).toEqual(['string', 'null']);

    // items
    const s3 = normalizeSchema({ type: 'array', items: { type: 'string' } });
    expect(s3.items.type).toBe('string');

    // additionalProperties
    const s4 = normalizeSchema({ type: 'object', additionalProperties: { type: 'number' } });
    expect((s4.additionalProperties as any).type).toBe('number');

    // oneOf / anyOf
    const s5 = normalizeSchema({ oneOf: [{ type: 'string' }], anyOf: [{ type: 'number' }] });
    expect(s5.oneOf[0].type).toBe('string');
    expect(s5.anyOf[0].type).toBe('number');
  });
});
