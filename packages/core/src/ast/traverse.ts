import type { NormalizedAST, Endpoint, Schema, Parameter, ResponseDef } from '../types/index.js';

export interface ASTVisitor {
  onEndpoint?: (endpoint: Endpoint) => void;
  onParameter?: (parameter: Parameter, endpoint: Endpoint) => void;
  onResponse?: (response: ResponseDef, statusCode: string, endpoint: Endpoint) => void;
  onSchema?: (schema: Schema, context: { type: 'parameter' | 'requestBody' | 'response' | 'component', name?: string, endpoint?: Endpoint }) => void;
}

export function traverseAST(ast: NormalizedAST, visitor: ASTVisitor) {
  if (ast.components?.schemas && visitor.onSchema) {
    for (const [name, schema] of Object.entries(ast.components.schemas)) {
      visitor.onSchema(schema, { type: 'component', name });
    }
  }

  for (const endpoint of ast.endpoints) {
    if (visitor.onEndpoint) {
      visitor.onEndpoint(endpoint);
    }

    if (endpoint.parameters) {
      for (const param of endpoint.parameters) {
        if (visitor.onParameter) visitor.onParameter(param, endpoint);
        if (visitor.onSchema && param.schema) {
          visitor.onSchema(param.schema, { type: 'parameter', name: param.name, endpoint });
        }
      }
    }

    if (endpoint.requestBody?.content) {
      for (const [mediaType, content] of Object.entries(endpoint.requestBody.content)) {
        if (visitor.onSchema && content.schema) {
          visitor.onSchema(content.schema, { type: 'requestBody', name: mediaType, endpoint });
        }
      }
    }

    if (endpoint.responses) {
      for (const res of endpoint.responses) {
        if (visitor.onResponse) visitor.onResponse(res, res.statusCode, endpoint);
        if (res.content) {
          for (const [mediaType, content] of Object.entries(res.content)) {
            if (visitor.onSchema && content.schema) {
              visitor.onSchema(content.schema, { type: 'response', name: mediaType, endpoint });
            }
          }
        }
        if (res.headers) {
          for (const [headerName, header] of Object.entries(res.headers)) {
            if (visitor.onSchema && header.schema) {
              visitor.onSchema(header.schema, { type: 'response', name: `header:${headerName}`, endpoint });
            }
          }
        }
      }
    }
  }
}
