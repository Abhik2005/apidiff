import { describe, it, expect } from 'vitest';
import { normalizeSchema } from '../../src/parsers/openapi3/schema-normalizer.js';

describe('Schema Normalizer', () => {
  it('merges allOf arrays', () => {
    const schema = {
      allOf: [
        { type: 'object', properties: { a: { type: 'string' } }, required: ['a'] },
        { type: 'object', properties: { b: { type: 'number' } }, required: ['b'] }
      ]
    };
    
    const normalized = normalizeSchema(schema);
    expect(normalized.type).toBe('object');
    expect(normalized.properties).toBeDefined();
    expect(normalized.properties?.a.type).toBe('string');
    expect(normalized.properties?.b.type).toBe('number');
    expect(normalized.required).toContain('a');
    expect(normalized.required).toContain('b');
  });

  it('normalizes oneOf/anyOf to empty object (fallback)', () => {
    const schema = {
      anyOf: [{ type: 'string' }, { type: 'number' }]
    };
    const normalized = normalizeSchema(schema);
    expect(normalized.type).toBeUndefined(); // currently normalizer drops it or picks first?
    // Looking at schema-normalizer, it says: "In a robust implementation, we'd handle anyOf/oneOf properly."
  });
});
