import { describe, it, expect } from 'vitest';
import { resolveRefs } from '../../src/parsers/openapi3/ref-resolver.js';

describe('Ref Resolver', () => {
  it('resolves simple local refs', () => {
    const doc = {
      components: {
        schemas: {
          A: { type: 'string' }
        }
      },
      paths: {
        '/test': {
          get: {
            responses: {
              '200': {
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/A' }
                  }
                }
              }
            }
          }
        }
      }
    };
    
    const resolved = resolveRefs(doc, doc) as any;
    expect(resolved.paths['/test'].get.responses['200'].content['application/json'].schema.type).toBe('string');
  });

  it('handles circular references safely', () => {
    const doc = {
      components: {
        schemas: {
          Node: {
            type: 'object',
            properties: {
              child: { $ref: '#/components/schemas/Node' }
            }
          }
        }
      }
    };
    const resolved = resolveRefs(doc, doc) as any;
    // Circular reference should point to an empty object or just stop without throwing a stack overflow
    expect(resolved.components.schemas.Node.properties.child).toBeDefined();
  });

  it('throws on unresolvable local ref', () => {
    const doc = {
      test: { $ref: '#/components/schemas/NotFound' }
    };
    expect(() => resolveRefs(doc, doc)).toThrow('Local ref not found');
  });

  it('throws on missing sourcePath for relative ref', () => {
    const doc = {
      test: { $ref: './external.yaml' }
    };
    expect(() => resolveRefs(doc, doc)).toThrow('Cannot resolve relative ref without sourcePath');
  });

  it('throws on unsupported ref format', () => {
    const doc = {
      test: { $ref: 'invalid-ref' }
    };
    expect(() => resolveRefs(doc, doc, '/base/path.yaml')).toThrow('Unsupported ref format');
  });

  it('throws on url ref', () => {
    const doc = {
      test: { $ref: 'https://example.com/schema.json' }
    };
    expect(() => resolveRefs(doc, doc)).toThrow('URL refs not implemented synchronously');
  });
});
