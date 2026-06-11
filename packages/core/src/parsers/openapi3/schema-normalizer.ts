import type { Schema } from '../../types/index.js';

export function normalizeSchema(schema: any): Schema {
  if (!schema || typeof schema !== 'object') return schema;

  if (Array.isArray(schema.allOf)) {
    const merged = flattenAllOf(schema.allOf);
    schema = { ...schema, ...merged };
    delete schema.allOf;
  }

  if (schema.nullable === true) {
    if (typeof schema.type === 'string') {
      schema.type = [schema.type, 'null'];
    } else if (Array.isArray(schema.type) && !schema.type.includes('null')) {
      schema.type = [...schema.type, 'null'];
    }
    delete schema.nullable;
  }

  if (schema.properties) {
    for (const key of Object.keys(schema.properties)) {
      schema.properties[key] = normalizeSchema(schema.properties[key]);
    }
  }
  if (schema.items) {
    schema.items = normalizeSchema(schema.items);
  }
  if (schema.additionalProperties && typeof schema.additionalProperties === 'object') {
    schema.additionalProperties = normalizeSchema(schema.additionalProperties);
  }
  if (Array.isArray(schema.oneOf)) {
    schema.oneOf = schema.oneOf.map(normalizeSchema);
  }
  if (Array.isArray(schema.anyOf)) {
    schema.anyOf = schema.anyOf.map(normalizeSchema);
  }

  return schema as Schema;
}

function flattenAllOf(schemas: any[]): any {
  return schemas.reduce((merged, subSchema) => {
    const normalized = normalizeSchema(subSchema);
    return {
      ...merged,
      ...normalized,
      properties: { ...(merged.properties || {}), ...(normalized.properties || {}) },
      required: [...new Set([...(merged.required || []), ...(normalized.required || [])])]
    };
  }, {});
}
