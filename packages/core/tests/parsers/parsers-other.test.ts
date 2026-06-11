import { describe, it, expect } from 'vitest';
import { GraphqlParser } from '../../src/parsers/graphql/index.js';
import { OpenApi2Parser } from '../../src/parsers/openapi2/index.js';
import { ProtobufParser } from '../../src/parsers/protobuf/index.js';

describe('Other Parsers', () => {
  describe('GraphqlParser', () => {
    it('can parse graphql', () => {
      const parser = new GraphqlParser();
      expect(parser.canParse({ content: 'type Query { hello: String! }', format: 'graphql' })).toBe(true);
    });

    it('parses simple schema', async () => {
      const parser = new GraphqlParser();
      const ast = await parser.parse({
        content: `
          type Query { hello(name: String!): String! }
          type Mutation { create(id: ID!, tags: [String]): Boolean }
          input Config { key: String! }
          interface Node { id: ID! }
          enum Status { ACTIVE INACTIVE }
        `,
        format: 'graphql'
      });
      expect(ast.endpoints).toHaveLength(2);
      expect(ast.endpoints[0].id).toBe('POST:query.hello');
      expect(ast.components.schemas['Status'].type).toBe('string');
      expect(ast.components.schemas['Config'].type).toBe('object');
      expect(ast.components.schemas['Node'].type).toBe('object');
    });

    it('throws on invalid', async () => {
      const parser = new GraphqlParser();
      await expect(parser.parse({ content: 'invalid' })).rejects.toThrow('Failed to parse GraphQL');
    });
  });

  describe('OpenApi2Parser', () => {
    it('can parse openapi2', () => {
      const parser = new OpenApi2Parser();
      expect(parser.canParse({ content: '', format: 'openapi2' })).toBe(true);
    });

    it('parses swagger 2.0', async () => {
      const parser = new OpenApi2Parser();
      const ast = await parser.parse({
        content: JSON.stringify({
          swagger: '2.0',
          info: { title: 'Test', version: '1' },
          host: 'api.example.com',
          schemes: ['http', 'https'],
          basePath: '/v1',
          securityDefinitions: { basic: { type: 'basic' } },
          security: [{ basic: [] }],
          paths: {
            '/test/{id}': {
              parameters: [{ name: 'id', in: 'path', required: true, type: 'string' }],
              get: {
                operationId: 'getTest',
                tags: ['test'],
                parameters: [
                  { name: 'q', in: 'query', type: 'string' },
                  { name: 'body', in: 'body', schema: { type: 'object' } }
                ],
                responses: { '200': { description: 'ok', headers: { 'X-Test': { type: 'string' } }, schema: { type: 'string' } } },
                'x-test': true
              },
              post: {
                consumes: ['multipart/form-data'],
                parameters: [
                  { name: 'file', in: 'formData', type: 'file', required: true }
                ],
                responses: { '204': { description: 'ok' } }
              }
            }
          },
          definitions: { User: { type: 'object' } }
        }),
        format: 'openapi2'
      });
      expect(ast.endpoints).toHaveLength(2);
      expect(ast.servers).toHaveLength(2);
      expect(ast.components.schemas['User']).toBeDefined();
    });

    it('throws on invalid format', async () => {
      const parser = new OpenApi2Parser();
      await expect(parser.parse({ content: '{}' })).rejects.toThrow('Not a valid OpenAPI 2.x spec');
      await expect(parser.parse({ content: 'invalid: { yaml' })).rejects.toThrow();
    });
  });

  describe('ProtobufParser', () => {
    it('can parse proto', () => {
      const parser = new ProtobufParser();
      expect(parser.canParse({ content: 'syntax = "proto3";', format: 'protobuf' })).toBe(true);
    });

    it('parses simple proto', async () => {
      const parser = new ProtobufParser();
      const ast = await parser.parse({
        content: `
          syntax = "proto3";
          package test.pkg;
          service TestService {
            // A method
            rpc Get(Request) returns (Response);
          }
          message Request { 
            string id = 1; 
            repeated string tags = 2;
            Nested msg = 3;
            double d = 4;
            int32 i = 5;
            int64 l = 6;
            bool b = 7;
            bytes by = 8;
          }
          message Response { bool ok = 1; }
          enum Status { OK = 0; ERR = 1; }
          message Nested { string n = 1; }
        `,
        format: 'protobuf'
      });
      expect(ast.endpoints).toHaveLength(1);
      expect(ast.endpoints[0].id).toBe('RPC:test.pkg.TestService/Get');
      expect(ast.components.schemas['test.pkg.Request']).toBeDefined();
    });

    it('throws on invalid', async () => {
      const parser = new ProtobufParser();
      await expect(parser.parse({ content: 'invalid' })).rejects.toThrow('Failed to parse Protobuf');
    });
  });
});
