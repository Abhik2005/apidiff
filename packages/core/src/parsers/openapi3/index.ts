import { resolveRefs } from './ref-resolver.js';
import { normalizeSchema } from './schema-normalizer.js';
import { normalizeSecurity } from './security-normalizer.js';
import type { NormalizedAST, Endpoint, Parameter, RequestBody, ResponseDef, ComponentMap, HttpMethod } from '../../types/index.js';
import type { RawSpec } from '../../loader/index.js';
import type { ISpecParser } from '../base.js';
import { ParseError } from '../../types/errors.js';
import yaml from 'js-yaml';

export class OpenApi3Parser implements ISpecParser {
  readonly format = 'openapi3';

  canParse(raw: RawSpec): boolean {
    return raw.format === 'openapi3';
  }

  async parse(raw: RawSpec): Promise<NormalizedAST> {
    let parsed: any;
    try {
      parsed = JSON.parse(raw.content);
    } catch {
      try {
        parsed = yaml.load(raw.content);
      } catch (err: any) {
        throw new ParseError('Failed to parse OpenAPI 3.x spec', undefined, undefined, raw.sourcePath, err);
      }
    }

    if (!parsed || typeof parsed !== 'object' || !parsed.openapi || !parsed.openapi.startsWith('3.')) {
      throw new ParseError('Not a valid OpenAPI 3.x spec', undefined, undefined, raw.sourcePath);
    }

    const resolved = resolveRefs(parsed, parsed, raw.sourcePath);

    const meta = {
      title: resolved.info?.title || 'Unknown API',
      version: resolved.info?.version || '1.0.0',
      format: 'openapi3' as const,
      rawVersion: resolved.openapi
    };

    const servers = (resolved.servers || []).map((s: any) => ({
      url: s.url,
      description: s.description,
      variables: s.variables
    }));

    const components: ComponentMap = {
      schemas: {},
      securitySchemes: {},
      parameters: {},
      responses: {},
      headers: {},
      requestBodies: {}
    };

    if (resolved.components?.schemas) {
      for (const [k, v] of Object.entries(resolved.components.schemas)) {
        components.schemas[k] = normalizeSchema(v);
      }
    }
    
    const securitySchemes = resolved.components?.securitySchemes || {};
    for (const [k, v] of Object.entries(securitySchemes)) {
      components.securitySchemes[k] = v as any;
    }

    const endpoints: Endpoint[] = [];
    const paths = resolved.paths || {};

    const globalSecurity = resolved.security;

    const allowedMethods = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options', 'trace'];

    for (const [pathStr, pathItem] of Object.entries(paths)) {
      if (!pathItem || typeof pathItem !== 'object') continue;

      const pathParams = Array.isArray((pathItem as any).parameters) ? (pathItem as any).parameters : [];

      for (const methodStr of Object.keys(pathItem)) {
        if (!allowedMethods.includes(methodStr)) continue;
        const op = pathItem[methodStr as keyof typeof pathItem] as any;
        if (!op || typeof op !== 'object') continue;

        const method = methodStr.toUpperCase() as HttpMethod;
        const id = `${method}:${normalizePathForId(pathStr)}`;

        const opParams = Array.isArray(op.parameters) ? op.parameters : [];
        const parameters = buildParameters(pathParams, opParams);

        const security = op.security !== undefined 
          ? normalizeSecurity(op.security) 
          : normalizeSecurity(globalSecurity);

        const endpoint: Endpoint = {
          id,
          path: pathStr,
          method,
          summary: op.summary,
          description: op.description,
          operationId: op.operationId,
          tags: Array.isArray(op.tags) ? op.tags : [],
          deprecated: !!op.deprecated,
          security,
          parameters,
          requestBody: op.requestBody ? buildRequestBody(op.requestBody) : undefined,
          responses: buildResponses(op.responses),
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
    };
  }
}

function normalizePathForId(path: string): string {
  return path
    .toLowerCase()
    .replace(/\/$/, '')
    .replace(/\{[^}]+\}/g, '{*}');
}

function buildParameters(pathParams: any[], opParams: any[]): Parameter[] {
  const paramMap = new Map<string, Parameter>();
  
  for (const p of pathParams) {
    paramMap.set(`${p.name}:${p.in}`, {
      name: p.name,
      in: p.in,
      required: !!p.required,
      deprecated: !!p.deprecated,
      description: p.description,
      schema: normalizeSchema(p.schema || {}),
      example: p.example
    });
  }

  for (const p of opParams) {
    paramMap.set(`${p.name}:${p.in}`, {
      name: p.name,
      in: p.in,
      required: !!p.required,
      deprecated: !!p.deprecated,
      description: p.description,
      schema: normalizeSchema(p.schema || {}),
      example: p.example
    });
  }

  return Array.from(paramMap.values());
}

function buildRequestBody(rb: any): RequestBody {
  const content: Record<string, any> = {};
  if (rb.content) {
    for (const [k, v] of Object.entries<any>(rb.content)) {
      content[k] = {
        schema: normalizeSchema(v.schema || {}),
        example: v.example
      };
    }
  }
  return {
    required: !!rb.required,
    description: rb.description,
    content
  };
}

function buildResponses(responses: any): ResponseDef[] {
  if (!responses || typeof responses !== 'object') return [];
  const res: ResponseDef[] = [];
  for (const [code, r] of Object.entries<any>(responses)) {
    const content: Record<string, any> = {};
    if (r.content) {
      for (const [k, v] of Object.entries<any>(r.content)) {
        content[k] = {
          schema: normalizeSchema(v.schema || {}),
          example: v.example
        };
      }
    }
    const headers: Record<string, any> = {};
    if (r.headers) {
      for (const [k, v] of Object.entries<any>(r.headers)) {
        headers[k] = {
          required: !!v.required,
          deprecated: !!v.deprecated,
          schema: normalizeSchema(v.schema || {}),
          description: v.description
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
