import protobuf from 'protobufjs';
import type { NormalizedAST, Endpoint, Parameter, RequestBody, ResponseDef, ComponentMap, Schema } from '../../types/index.js';
import type { RawSpec } from '../../loader/index.js';
import type { ISpecParser } from '../base.js';
import { ParseError } from '../../types/errors.js';

export class ProtobufParser implements ISpecParser {
  readonly format = 'protobuf';

  canParse(raw: RawSpec): boolean {
    return raw.format === 'protobuf' || raw.content.trim().startsWith('syntax = "proto');
  }

  async parse(raw: RawSpec): Promise<NormalizedAST> {
    let root: protobuf.Root;
    try {
      // Create a virtual file to parse the content string
      const parsed = protobuf.parse(raw.content, { keepCase: true });
      root = parsed.root;
    } catch (err: any) {
      throw new ParseError('Failed to parse Protobuf spec', err.line, err.column, raw.sourcePath, err);
    }

    const meta = {
      title: 'Protobuf API',
      version: '1.0.0', // Protobuf doesn't have a standard version field
      format: 'protobuf' as const,
      rawVersion: '3' // Assume proto3 for now
    };

    const components: ComponentMap = {
      schemas: {},
      securitySchemes: {},
      parameters: {},
      responses: {},
      headers: {},
      requestBodies: {}
    };

    const endpoints: Endpoint[] = [];

    // Recursively walk the AST
    this.walkRoot(root, '', components, endpoints);

    return {
      meta,
      servers: [],
      endpoints,
      components,
      security: []
    };
  }

  private walkRoot(node: protobuf.ReflectionObject, namespace: string, components: ComponentMap, endpoints: Endpoint[]) {
    if (node instanceof protobuf.Type) {
      // It's a Message
      components.schemas[`${namespace}${node.name}`] = this.messageToSchema(node);
    } else if (node instanceof protobuf.Enum) {
      // It's an Enum
      components.schemas[`${namespace}${node.name}`] = this.enumToSchema(node);
    } else if (node instanceof protobuf.Service) {
      // It's a Service
      for (const method of node.methodsArray) {
        endpoints.push(this.methodToEndpoint(method, `${namespace}${node.name}`));
      }
    } else if (node instanceof protobuf.Namespace) {
      // Walk namespace children
      const newNamespace = node.name ? `${namespace}${node.name}.` : namespace;
      for (const child of node.nestedArray) {
        this.walkRoot(child, newNamespace, components, endpoints);
      }
    }
  }

  private messageToSchema(message: protobuf.Type): Schema {
    const properties: Record<string, Schema> = {};
    const required: string[] = [];

    for (const field of message.fieldsArray) {
      const fieldSchema = this.typeToSchema(field);
      // We attach the protobuf field number to an internal property so we can diff it
      (fieldSchema as any).$protobufNumber = field.id;
      
      properties[field.name] = fieldSchema;
      if (field.required) {
        required.push(field.name);
      }
    }

    const schema: Schema = {
      type: 'object',
      properties
    };

    if (required.length > 0) {
      schema.required = required;
    }

    return schema;
  }

  private enumToSchema(enumObj: protobuf.Enum): Schema {
    return {
      type: 'string',
      enum: Object.keys(enumObj.values)
    };
  }

  private typeToSchema(field: protobuf.Field): Schema {
    let schema: Schema = {};
    
    switch (field.type) {
      case 'double':
      case 'float':
        schema.type = 'number';
        schema.format = field.type;
        break;
      case 'int32':
      case 'uint32':
      case 'sint32':
      case 'fixed32':
      case 'sfixed32':
        schema.type = 'integer';
        schema.format = field.type;
        break;
      case 'int64':
      case 'uint64':
      case 'sint64':
      case 'fixed64':
      case 'sfixed64':
        schema.type = 'integer';
        schema.format = 'int64'; // or field.type
        break;
      case 'bool':
        schema.type = 'boolean';
        break;
      case 'string':
        schema.type = 'string';
        break;
      case 'bytes':
        schema.type = 'string';
        schema.format = 'byte';
        break;
      default:
        // It's a reference to another message or enum
        // In a real implementation we'd use a $ref, but we are flattening
        // For simplicity, we just mark it as object and we could potentially reference it.
        // Or if we can find the resolved type in the parent namespace:
        schema.type = 'object'; // It's a message type ref
        (schema as any).$ref = `#/components/schemas/${field.type}`;
        break;
    }

    if (field.repeated) {
      return {
        type: 'array',
        items: schema
      };
    }

    return schema;
  }

  private methodToEndpoint(method: protobuf.Method, servicePath: string): Endpoint {
    const id = `RPC:${servicePath}/${method.name}`;
    const path = `${servicePath}/${method.name}`;

    const requestBody: RequestBody = {
      required: true,
      content: {
        'application/protobuf': {
          schema: {
            $ref: `#/components/schemas/${method.requestType}`
          } as any
        }
      }
    };

    const responses: ResponseDef[] = [
      {
        statusCode: '200',
        description: 'Successful response',
        content: {
          'application/protobuf': {
            schema: {
              $ref: `#/components/schemas/${method.responseType}`
            } as any
          }
        },
        headers: {}
      }
    ];

    return {
      id,
      path,
      method: 'RPC',
      summary: method.comment || undefined,
      tags: [servicePath],
      deprecated: !!method.options?.deprecated,
      security: [], // Protobuf doesn't specify security natively
      parameters: [],
      requestBody,
      responses,
      extensions: {}
    };
  }
}
