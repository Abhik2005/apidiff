import type { NormalizedAST, Endpoint, Parameter, RequestBody, ResponseDef, ComponentMap, HttpMethod, Server } from '../../types/index.js';
import type { RawSpec } from '../../loader/index.js';
import type { ISpecParser } from '../base.js';
import { ParseError } from '../../types/errors.js';
import { normalizeSchema } from '../openapi3/schema-normalizer.js';
import yaml from 'js-yaml';

export class OpenApi2Parser implements ISpecParser {
  readonly format = 'openapi2';

  canParse(raw: RawSpec): boolean {
    return raw.format === 'openapi2';
  }

  async parse(raw: RawSpec): Promise<NormalizedAST> {
    let parsed: any;
    try {
      parsed = JSON.parse(raw.content);
    } catch {
      try {
        parsed = yaml.load(raw.content);
      } catch (err: any) {
        throw new ParseError('Failed to parse OpenAPI 2.x spec', undefined, undefined, raw.sourcePath, err);
      }
    }

    if (!parsed || typeof parsed !== 'object' || !parsed.swagger || !parsed.swagger.startsWith('2.')) {
      throw new ParseError('Not a valid OpenAPI 2.x spec', undefined, undefined, raw.sourcePath);
    }

    // In a real implementation we would resolve refs, but for now we'll assume they are resolved or handle them simply.
    // We should use the same ref-resolver used in openapi3 if possible, but Swagger 2.0 has different structure.
    // For this implementation, we will use the raw parsed object.
    const resolved = parsed; // TODO: proper ref resolution

    const meta = {
      title: resolved.info?.title || 'Unknown API',
      version: resolved.info?.version || '1.0.0',
      format: 'openapi2' as const,
      rawVersion: resolved.swagger
    };

    const servers: Server[] = [];
    if (resolved.host) {
      const schemes = Array.isArray(resolved.schemes) && resolved.schemes.length > 0 ? resolved.schemes : ['https'];
      const basePath = resolved.basePath || '';
      for (const scheme of schemes) {
        servers.push({ url: `${scheme}://${resolved.host}${basePath}` });
      }
    }

    const components: ComponentMap = {
      schemas: {},
      securitySchemes: {},
      parameters: {},
      responses: {},
      headers: {},
      requestBodies: {}
    };

    if (resolved.definitions) {
      for (const [k, v] of Object.entries(resolved.definitions)) {
        components.schemas[k] = normalizeSchema(v as any);
      }
    }

    const securitySchemes = resolved.securityDefinitions || {};
    for (const [k, v] of Object.entries(securitySchemes)) {
      components.securitySchemes[k] = v as any;
    }

    const endpoints: Endpoint[] = [];
    const paths = resolved.paths || {};
    const globalSecurity = resolved.security || [];

    const allowedMethods = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options', 'trace'];

    for (const [pathStr, pathItem] of Object.entries(paths)) {
      if (!pathItem || typeof pathItem !== 'object') continue;

      const pathParams = Array.isArray((pathItem as any).parameters) ? (pathItem as any).parameters : [];

      for (const methodStr of Object.keys(pathItem)) {
        if (!allowedMethods.includes(methodStr)) continue;
        const op = (pathItem as any)[methodStr];
        if (!op || typeof op !== 'object') continue;

        const method = methodStr.toUpperCase() as HttpMethod;
        const id = `${method}:${normalizePathForId(pathStr)}`;

        const opParams = Array.isArray(op.parameters) ? op.parameters : [];
        const { parameters, requestBody } = buildParametersAndBody(pathParams, opParams, resolved.consumes || op.consumes || ['application/json']);

        const endpoint: Endpoint = {
          id,
          path: pathStr,
          method,
          summary: op.summary,
          description: op.description,
          operationId: op.operationId,
          tags: Array.isArray(op.tags) ? op.tags : [],
          deprecated: !!op.deprecated,
          security: op.security || globalSecurity,
          parameters,
          requestBody,
          responses: buildResponses(op.responses, resolved.produces || op.produces || ['application/json']),
          extensions: extractExtensions(op)
        };

        endpoints.push(endpoint);
      }
    }

    return {
      meta,
      servers,
      endpoints,
      components,
      security: Object.values(components.securitySchemes)
    } as unknown as NormalizedAST;
  }
}

function normalizePathForId(path: string): string {
  return path
    .toLowerCase()
    .replace(/\/$/, '')
    .replace(/\{[^}]+\}/g, '{*}');
}

function buildParametersAndBody(pathParams: any[], opParams: any[], consumes: string[]): { parameters: Parameter[], requestBody?: RequestBody } {
  const paramMap = new Map<string, Parameter>();
  let requestBody: RequestBody | undefined = undefined;

  const allParams = [...pathParams, ...opParams];

  for (const p of allParams) {
    if (p.in === 'body') {
      const content: Record<string, any> = {};
      for (const mime of consumes) {
        content[mime] = { schema: normalizeSchema(p.schema || {}) };
      }
      requestBody = {
        required: !!p.required,
        description: p.description,
        content
      };
    } else if (p.in === 'formData') {
      // In OpenAPI 3, formData becomes requestBody with application/x-www-form-urlencoded or multipart/form-data
      if (!requestBody) {
        requestBody = { required: false, content: {} };
      }
      const mime = consumes.includes('multipart/form-data') ? 'multipart/form-data' : 'application/x-www-form-urlencoded';
      if (!requestBody.content[mime]) {
        requestBody.content[mime] = { schema: { type: 'object', properties: {} } };
      }
      const schema = requestBody.content[mime].schema;
      if (!schema.properties) schema.properties = {};
      schema.properties[p.name] = normalizeSchema(p);
      if (p.required) {
        if (!schema.required) schema.required = [];
        schema.required.push(p.name);
      }
    } else {
      paramMap.set(`${p.name}:${p.in}`, {
        name: p.name,
        in: p.in as any,
        required: !!p.required,
        deprecated: false,
        description: p.description,
        schema: normalizeSchema(p)
      });
    }
  }

  return { parameters: Array.from(paramMap.values()), requestBody };
}

function buildResponses(responses: any, produces: string[]): ResponseDef[] {
  if (!responses || typeof responses !== 'object') return [];
  const res: ResponseDef[] = [];
  for (const [code, r] of Object.entries<any>(responses)) {
    const content: Record<string, any> = {};
    if (r.schema) {
      for (const mime of produces) {
        content[mime] = { schema: normalizeSchema(r.schema) };
      }
    }
    const headers: Record<string, any> = {};
    if (r.headers) {
      for (const [k, v] of Object.entries<any>(r.headers)) {
        headers[k] = {
          schema: normalizeSchema(v as any),
          description: (v as any).description
        };
      }
    }
    res.push({
      statusCode: code,
      description: r.description,
      content,
      headers
    });
  }
  return res;
}

function extractExtensions(obj: any): Record<string, unknown> {
  const ext: Record<string, unknown> = {};
  if (obj && typeof obj === 'object') {
    for (const k of Object.keys(obj)) {
      if (k.startsWith('x-')) {
        ext[k] = obj[k];
      }
    }
  }
  return ext;
}
