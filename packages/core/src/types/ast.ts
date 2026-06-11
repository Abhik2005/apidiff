export type SpecFormat = 'openapi3' | 'openapi2' | 'protobuf' | 'graphql';

export type HttpMethod =
  | 'GET' | 'POST' | 'PUT' | 'PATCH'
  | 'DELETE' | 'HEAD' | 'OPTIONS' | 'TRACE';

export interface NormalizedAST {
  meta: SpecMeta;
  servers: Server[];
  endpoints: Endpoint[];
  components: ComponentMap;
  security: SecurityScheme[];
}

export interface SpecMeta {
  title: string;
  version: string;
  format: SpecFormat;
  rawVersion: string;
}

export interface Server {
  url: string;
  description?: string;
  variables?: Record<string, ServerVariable>;
}

export interface ServerVariable {
  default: string;
  enum?: string[];
  description?: string;
}

export interface Endpoint {
  id: string;
  path: string;
  method: HttpMethod | 'RPC';
  summary?: string;
  description?: string;
  operationId?: string;
  tags: string[];
  deprecated: boolean;
  security: SecurityRequirement[];
  parameters: Parameter[];
  requestBody?: RequestBody;
  responses: ResponseDef[];
  extensions: Record<string, unknown>;
}

export interface Parameter {
  name: string;
  in: 'path' | 'query' | 'header' | 'cookie';
  required: boolean;
  deprecated: boolean;
  schema: Schema;
  description?: string;
  example?: unknown;
}

export interface RequestBody {
  required: boolean;
  description?: string;
  content: Record<string, MediaTypeObject>;
}

export interface MediaTypeObject {
  schema: Schema;
  example?: unknown;
}

export interface ResponseDef {
  statusCode: string;
  description?: string;
  content: Record<string, MediaTypeObject>;
  headers: Record<string, HeaderDef>;
}

export interface HeaderDef {
  required?: boolean;
  deprecated?: boolean;
  schema: Schema;
  description?: string;
}

export interface Schema {
  type?: string | string[];
  format?: string;
  nullable?: boolean;
  description?: string;
  default?: unknown;
  example?: unknown;
  deprecated?: boolean;
  readOnly?: boolean;
  writeOnly?: boolean;

  required?: string[];
  properties?: Record<string, Schema>;
  additionalProperties?: boolean | Schema;
  items?: Schema;
  enum?: unknown[];
  const?: unknown;

  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: number | boolean;
  exclusiveMaximum?: number | boolean;
  multipleOf?: number;

  minLength?: number;
  maxLength?: number;
  pattern?: string;

  minItems?: number;
  maxItems?: number;
  uniqueItems?: boolean;

  allOf?: Schema[];
  oneOf?: Schema[];
  anyOf?: Schema[];
  not?: Schema;

  $circular?: true;
  $ref?: string;
}

export interface SecurityRequirement {
  schemeId: string;
  scopes: string[];
}

export interface SecurityScheme {
  id: string;
  type: 'apiKey' | 'http' | 'oauth2' | 'openIdConnect' | 'mutualTLS';
  description?: string;
  name?: string;
  in?: 'header' | 'query' | 'cookie' | string;
  scheme?: string;
  bearerFormat?: string;
  flows?: OAuthFlows;
  openIdConnectUrl?: string;
}

export interface OAuthFlows {
  implicit?: OAuthFlow;
  password?: OAuthFlow;
  clientCredentials?: OAuthFlow;
  authorizationCode?: OAuthFlow;
}

export interface OAuthFlow {
  authorizationUrl?: string;
  tokenUrl?: string;
  refreshUrl?: string;
  scopes: Record<string, string>;
}

export interface ComponentMap {
  schemas: Record<string, Schema>;
  securitySchemes: Record<string, SecurityScheme>;
  parameters: Record<string, Parameter>;
  responses: Record<string, ResponseDef>;
  headers: Record<string, HeaderDef>;
  requestBodies: Record<string, RequestBody>;
}
