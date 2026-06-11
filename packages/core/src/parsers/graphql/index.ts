import { parse as parseGraphql, DocumentNode, ObjectTypeDefinitionNode, FieldDefinitionNode, InputObjectTypeDefinitionNode, TypeNode, EnumTypeDefinitionNode } from 'graphql';
import type { NormalizedAST, Endpoint, Parameter, RequestBody, ResponseDef, ComponentMap, Schema } from '../../types/index.js';
import type { RawSpec } from '../../loader/index.js';
import type { ISpecParser } from '../base.js';
import { ParseError } from '../../types/errors.js';

export class GraphqlParser implements ISpecParser {
  readonly format = 'graphql';

  canParse(raw: RawSpec): boolean {
    return raw.format === 'graphql' || raw.content.includes('type Query') || raw.content.includes('type Mutation');
  }

  async parse(raw: RawSpec): Promise<NormalizedAST> {
    let ast: DocumentNode;
    try {
      ast = parseGraphql(raw.content);
    } catch (err: any) {
      throw new ParseError('Failed to parse GraphQL spec', err.locations?.[0]?.line, err.locations?.[0]?.column, raw.sourcePath, err);
    }

    const meta = {
      title: 'GraphQL API',
      version: '1.0.0',
      format: 'graphql' as const,
      rawVersion: '1'
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

    // First pass: extract schemas
    for (const def of ast.definitions) {
      if (def.kind === 'ObjectTypeDefinition' || def.kind === 'InputObjectTypeDefinition' || def.kind === 'InterfaceTypeDefinition') {
        components.schemas[def.name.value] = this.typeDefToSchema(def as any);
      } else if (def.kind === 'EnumTypeDefinition') {
        components.schemas[def.name.value] = this.enumDefToSchema(def);
      }
    }

    // Second pass: extract endpoints from Query, Mutation, Subscription
    for (const def of ast.definitions) {
      if (def.kind === 'ObjectTypeDefinition' && ['Query', 'Mutation', 'Subscription'].includes(def.name.value)) {
        const typeName = def.name.value;
        if (def.fields) {
          for (const field of def.fields) {
            endpoints.push(this.fieldToEndpoint(field, typeName));
          }
        }
      }
    }

    return {
      meta,
      servers: [],
      endpoints,
      components,
      security: []
    };
  }

  private typeDefToSchema(def: ObjectTypeDefinitionNode | InputObjectTypeDefinitionNode): Schema {
    const properties: Record<string, Schema> = {};
    const required: string[] = [];

    if (def.fields) {
      for (const field of def.fields) {
        const fieldName = field.name.value;
        properties[fieldName] = this.resolveTypeNode(field.type);
        if (field.type.kind === 'NonNullType') {
          required.push(fieldName);
        }
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

  private enumDefToSchema(def: EnumTypeDefinitionNode): Schema {
    const values = def.values?.map(v => v.name.value) || [];
    return {
      type: 'string',
      enum: values
    };
  }

  private resolveTypeNode(typeNode: TypeNode): Schema {
    if (typeNode.kind === 'NonNullType') {
      return this.resolveTypeNode(typeNode.type);
    }
    
    if (typeNode.kind === 'ListType') {
      return {
        type: 'array',
        items: this.resolveTypeNode(typeNode.type)
      };
    }

    // NamedType
    const typeName = typeNode.name.value;
    switch (typeName) {
      case 'Int':
        return { type: 'integer' };
      case 'Float':
        return { type: 'number' };
      case 'String':
      case 'ID':
        return { type: 'string' };
      case 'Boolean':
        return { type: 'boolean' };
      default:
        // Reference to another schema
        return {
          type: 'object',
          $ref: `#/components/schemas/${typeName}`
        } as any;
    }
  }

  private fieldToEndpoint(field: FieldDefinitionNode, parentType: string): Endpoint {
    const path = `${parentType}.${field.name.value}`;
    const id = `POST:${path.toLowerCase()}`;

    const parameters: Parameter[] = [];
    if (field.arguments) {
      for (const arg of field.arguments) {
        parameters.push({
          name: arg.name.value,
          in: 'query', // Map GraphQL args to 'query'
          required: arg.type.kind === 'NonNullType',
          deprecated: !!arg.directives?.some(d => d.name.value === 'deprecated'),
          description: arg.description?.value,
          schema: this.resolveTypeNode(arg.type)
        });
      }
    }

    const responses: ResponseDef[] = [
      {
        statusCode: '200',
        description: 'Successful response',
        content: {
          'application/graphql': {
            schema: this.resolveTypeNode(field.type)
          }
        },
        headers: {}
      }
    ];

    return {
      id,
      path,
      method: 'POST',
      summary: field.description?.value,
      tags: [parentType],
      deprecated: !!field.directives?.some(d => d.name.value === 'deprecated'),
      security: [],
      parameters,
      responses,
      extensions: {}
    };
  }
}
