import { describe, it, expect } from 'vitest';
import { OpenApi3Parser } from '../../src/parsers/openapi3/index.js';

describe('OpenAPI 3 Parser', () => {
  it('parses valid OpenAPI 3 document', async () => {
    const doc = {
      openapi: '3.0.0',
      info: { title: 'Test API', version: '1.0' },
      servers: [{ url: 'http://test.com' }],
      paths: {
        '/test': {
          get: {
            operationId: 'getTest',
            summary: 'Test',
            parameters: [{ name: 'q', in: 'query', required: true, schema: { type: 'string' } }],
            responses: {
              '200': {
                description: 'OK',
                content: { 'application/json': { schema: { type: 'string' } } }
              }
            }
          }
        }
      }
    };

    const parser = new OpenApi3Parser();
    const ast = await parser.parse({ content: JSON.stringify(doc), format: 'openapi3' });
    expect(ast.meta.title).toBe('Test API');
    expect(ast.endpoints).toHaveLength(1);
    expect(ast.endpoints[0].method).toBe('GET');
    expect(ast.endpoints[0].parameters).toHaveLength(1);
    expect(ast.endpoints[0].responses).toHaveLength(1);
    expect(ast.endpoints[0].responses[0].statusCode).toBe('200');
  });

  it('throws on unsupported version', async () => {
    const parser = new OpenApi3Parser();
    await expect(parser.parse({ content: JSON.stringify({ swagger: '2.0' }), format: 'openapi3' })).rejects.toThrow();
  });
});
