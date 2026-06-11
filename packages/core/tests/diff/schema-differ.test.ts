import { describe, it, expect } from 'vitest';
import { diffSchema } from '../../src/diff/schema-differ.js';
import type { Schema, FieldChange } from '../../src/types/index.js';

describe('Schema Differ', () => {
  it('detects type change', () => {
    const oldSchema: Schema = { type: 'string' };
    const newSchema: Schema = { type: 'number' };
    const changes: FieldChange[] = [];
    diffSchema(oldSchema, newSchema, ['schema'], changes);
    expect(changes).toContainEqual({ fieldPath: ['schema', 'type'], changeType: 'changed', oldValue: 'string', newValue: 'number' });
  });

  it('detects added property', () => {
    const oldSchema: Schema = { type: 'object', properties: {} };
    const newSchema: Schema = { type: 'object', properties: { newProp: { type: 'string' } } };
    const changes: FieldChange[] = [];
    diffSchema(oldSchema, newSchema, ['schema'], changes);
    expect(changes).toContainEqual({ fieldPath: ['schema', 'properties', 'newProp'], changeType: 'added', newValue: { type: 'string' } });
  });

  it('detects removed property', () => {
    const oldSchema: Schema = { type: 'object', properties: { oldProp: { type: 'string' } } };
    const newSchema: Schema = { type: 'object', properties: {} };
    const changes: FieldChange[] = [];
    diffSchema(oldSchema, newSchema, ['schema'], changes);
    expect(changes).toContainEqual({ fieldPath: ['schema', 'properties', 'oldProp'], changeType: 'removed', oldValue: { type: 'string' } });
  });

  it('detects required added/removed', () => {
    const oldSchema: Schema = { type: 'object', required: ['oldReq'] };
    const newSchema: Schema = { type: 'object', required: ['newReq'] };
    const changes: FieldChange[] = [];
    diffSchema(oldSchema, newSchema, ['schema'], changes);
    expect(changes).toContainEqual({ fieldPath: ['schema', 'required', 'newReq'], changeType: 'added', newValue: 'newReq' });
    expect(changes).toContainEqual({ fieldPath: ['schema', 'required', 'oldReq'], changeType: 'removed', oldValue: 'oldReq' });
  });

  it('detects nested schema differences', () => {
    const oldSchema: Schema = { type: 'object', properties: { nested: { type: 'object', properties: { field: { type: 'string' } } } } };
    const newSchema: Schema = { type: 'object', properties: { nested: { type: 'object', properties: { field: { type: 'number' } } } } };
    const changes: FieldChange[] = [];
    diffSchema(oldSchema, newSchema, ['schema'], changes);
    expect(changes).toContainEqual({ fieldPath: ['schema', 'properties', 'nested', 'properties', 'field', 'type'], changeType: 'changed', oldValue: 'string', newValue: 'number' });
  });
});
