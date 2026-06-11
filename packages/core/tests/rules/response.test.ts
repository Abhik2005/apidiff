import { describe, it, expect } from 'vitest';
import { ResponseFieldRemovedRule } from '../../src/rules/response/response-field-removed.js';
import { ResponseFieldAddedRule } from '../../src/rules/response/response-field-added.js';
import { ResponseFieldTypeChangedRule } from '../../src/rules/response/response-field-type-changed.js';
import { ResponseStatusRemovedRule } from '../../src/rules/response/response-status-removed.js';
import { ResponseStatusAddedRule } from '../../src/rules/response/response-status-added.js';
import { ResponseMediaTypeRemovedRule } from '../../src/rules/response/response-media-type-removed.js';
import { ResponseMediaTypeAddedRule } from '../../src/rules/response/response-media-type-added.js';
import { ResponseHeaderRemovedRule } from '../../src/rules/response/response-header-removed.js';
import { ResponseHeaderAddedRequiredRule } from '../../src/rules/response/response-header-added-required.js';
import type { DiffSet, RuleContext } from '../../src/types/index.js';

describe('Response Rules', () => {
  const context: RuleContext = {
    config: { failOn: 'breaking', disabledRules: [], ignorePaths: [], output: { format: 'terminal' } },
    oldSpec: { meta: { title: 'v1', version: '1.0.0', format: 'openapi3', rawVersion: '3.0.0' }, servers: [], endpoints: [], components: { schemas: {}, securitySchemes: {}, parameters: {}, responses: {}, headers: {}, requestBodies: {} }, security: [] },
    newSpec: { meta: { title: 'v2', version: '2.0.0', format: 'openapi3', rawVersion: '3.0.0' }, servers: [], endpoints: [], components: { schemas: {}, securitySchemes: {}, parameters: {}, responses: {}, headers: {}, requestBodies: {} }, security: [] },
  };

  const dummyEndpoint = { id: 'GET:/test', path: '/test', method: 'GET' as const, summary: '', description: '', tags: [], deprecated: false, security: [], parameters: [], responses: [] };

  it('RESPONSE_FIELD_REMOVED triggers when field is removed', () => {
    const diff: DiffSet = {
      endpointDiffs: [
        { type: 'changed', endpointId: 'GET:/test', path: '/test', method: 'GET', oldEndpoint: dummyEndpoint, newEndpoint: dummyEndpoint, fieldChanges: [
          { fieldPath: ['responses', '200', 'content', 'application/json', 'schema', 'properties', 'testField'], changeType: 'removed', oldValue: { type: 'string' } }
        ]}
      ], componentDiffs: []
    };
    const rule = new ResponseFieldRemovedRule();
    const changes = rule.apply(diff, context);
    expect(changes).toHaveLength(1);
    expect(changes[0].ruleId).toBe('RESPONSE_FIELD_REMOVED');
  });

  it('RESPONSE_FIELD_ADDED triggers when field is added', () => {
    const diff: DiffSet = {
      endpointDiffs: [
        { type: 'changed', endpointId: 'GET:/test', path: '/test', method: 'GET', oldEndpoint: dummyEndpoint, newEndpoint: dummyEndpoint, fieldChanges: [
          { fieldPath: ['responses', '200', 'content', 'application/json', 'schema', 'properties', 'testField'], changeType: 'added', newValue: { type: 'string' } }
        ]}
      ], componentDiffs: []
    };
    const rule = new ResponseFieldAddedRule();
    const changes = rule.apply(diff, context);
    expect(changes).toHaveLength(1);
    expect(changes[0].ruleId).toBe('RESPONSE_FIELD_ADDED');
  });

  it('RESPONSE_FIELD_TYPE_CHANGED triggers when type changes', () => {
    const diff: DiffSet = {
      endpointDiffs: [
        { type: 'changed', endpointId: 'GET:/test', path: '/test', method: 'GET', oldEndpoint: dummyEndpoint, newEndpoint: dummyEndpoint, fieldChanges: [
          { fieldPath: ['responses', '200', 'content', 'application/json', 'schema', 'properties', 'testField', 'type'], changeType: 'changed', oldValue: 'string', newValue: 'number' }
        ]}
      ], componentDiffs: []
    };
    const rule = new ResponseFieldTypeChangedRule();
    const changes = rule.apply(diff, context);
    expect(changes).toHaveLength(1);
    expect(changes[0].ruleId).toBe('RESPONSE_FIELD_TYPE_CHANGED');
  });

  it('RESPONSE_STATUS_REMOVED triggers when status code is removed', () => {
    const diff: DiffSet = {
      endpointDiffs: [
        { type: 'changed', endpointId: 'GET:/test', path: '/test', method: 'GET', oldEndpoint: dummyEndpoint, newEndpoint: dummyEndpoint, fieldChanges: [
          { fieldPath: ['responses', '201'], changeType: 'removed', oldValue: {} }
        ]}
      ], componentDiffs: []
    };
    const rule = new ResponseStatusRemovedRule();
    const changes = rule.apply(diff, context);
    expect(changes).toHaveLength(1);
    expect(changes[0].ruleId).toBe('RESPONSE_STATUS_REMOVED');
  });

  it('RESPONSE_STATUS_ADDED triggers when status code is added', () => {
    const diff: DiffSet = {
      endpointDiffs: [
        { type: 'changed', endpointId: 'GET:/test', path: '/test', method: 'GET', oldEndpoint: dummyEndpoint, newEndpoint: dummyEndpoint, fieldChanges: [
          { fieldPath: ['responses', '201'], changeType: 'added', newValue: {} }
        ]}
      ], componentDiffs: []
    };
    const rule = new ResponseStatusAddedRule();
    const changes = rule.apply(diff, context);
    expect(changes).toHaveLength(1);
    expect(changes[0].ruleId).toBe('RESPONSE_STATUS_ADDED');
  });

  it('RESPONSE_MEDIA_TYPE_REMOVED triggers when media type is removed', () => {
    const diff: DiffSet = {
      endpointDiffs: [
        { type: 'changed', endpointId: 'GET:/test', path: '/test', method: 'GET', oldEndpoint: dummyEndpoint, newEndpoint: dummyEndpoint, fieldChanges: [
          { fieldPath: ['responses', '200', 'content', 'application/json'], changeType: 'removed', oldValue: {} }
        ]}
      ], componentDiffs: []
    };
    const rule = new ResponseMediaTypeRemovedRule();
    const changes = rule.apply(diff, context);
    expect(changes).toHaveLength(1);
    expect(changes[0].ruleId).toBe('RESPONSE_MEDIA_TYPE_REMOVED');
  });

  it('RESPONSE_MEDIA_TYPE_ADDED triggers when media type is added', () => {
    const diff: DiffSet = {
      endpointDiffs: [
        { type: 'changed', endpointId: 'GET:/test', path: '/test', method: 'GET', oldEndpoint: dummyEndpoint, newEndpoint: dummyEndpoint, fieldChanges: [
          { fieldPath: ['responses', '200', 'content', 'application/json'], changeType: 'added', newValue: {} }
        ]}
      ], componentDiffs: []
    };
    const rule = new ResponseMediaTypeAddedRule();
    const changes = rule.apply(diff, context);
    expect(changes).toHaveLength(1);
    expect(changes[0].ruleId).toBe('RESPONSE_MEDIA_TYPE_ADDED');
  });

  it('RESPONSE_HEADER_REMOVED triggers when header is removed', () => {
    const diff: DiffSet = {
      endpointDiffs: [
        { type: 'changed', endpointId: 'GET:/test', path: '/test', method: 'GET', oldEndpoint: dummyEndpoint, newEndpoint: dummyEndpoint, fieldChanges: [
          { fieldPath: ['responses', '200', 'headers', 'X-Rate-Limit'], changeType: 'removed', oldValue: {} }
        ]}
      ], componentDiffs: []
    };
    const rule = new ResponseHeaderRemovedRule();
    const changes = rule.apply(diff, context);
    expect(changes).toHaveLength(1);
    expect(changes[0].ruleId).toBe('RESPONSE_HEADER_REMOVED');
  });

  it('RESPONSE_HEADER_ADDED_REQUIRED triggers when required header is added', () => {
    const diff: DiffSet = {
      endpointDiffs: [
        { type: 'changed', endpointId: 'GET:/test', path: '/test', method: 'GET', oldEndpoint: dummyEndpoint, newEndpoint: dummyEndpoint, fieldChanges: [
          { fieldPath: ['responses', '200', 'headers', 'X-Rate-Limit'], changeType: 'added', newValue: { required: true } }
        ]}
      ], componentDiffs: []
    };
    const rule = new ResponseHeaderAddedRequiredRule();
    const changes = rule.apply(diff, context);
    expect(changes).toHaveLength(1);
    expect(changes[0].ruleId).toBe('RESPONSE_HEADER_ADDED_REQUIRED');
  });

  it('RESPONSE_HEADER_ADDED_REQUIRED triggers when optional header becomes required', () => {
    const diff: DiffSet = {
      endpointDiffs: [
        { type: 'changed', endpointId: 'GET:/test', path: '/test', method: 'GET', oldEndpoint: dummyEndpoint, newEndpoint: dummyEndpoint, fieldChanges: [
          { fieldPath: ['responses', '200', 'headers', 'X-Rate-Limit', 'required'], changeType: 'changed', oldValue: false, newValue: true }
        ]}
      ], componentDiffs: []
    };
    const rule = new ResponseHeaderAddedRequiredRule();
    const changes = rule.apply(diff, context);
    expect(changes).toHaveLength(1);
    expect(changes[0].ruleId).toBe('RESPONSE_HEADER_ADDED_REQUIRED');
  });
});
