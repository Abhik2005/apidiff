import { describe, it, expect } from 'vitest';
import { RequestBodyAddedRequiredRule } from '../../src/rules/request/request-body-added-required.js';
import { RequestBodyRemovedRule } from '../../src/rules/request/request-body-removed.js';
import { RequestContentTypeAddedRule } from '../../src/rules/request/request-content-type-added.js';
import { RequestContentTypeRemovedRule } from '../../src/rules/request/request-content-type-removed.js';
import { RequestFieldRemovedRule } from '../../src/rules/request/request-field-removed.js';
import { RequestFieldAddedRequiredRule } from '../../src/rules/request/request-field-added-required.js';
import { RequestFieldTypeChangedRule } from '../../src/rules/request/request-field-type-changed.js';
import { RequestRequiredFalseToTrueRule } from '../../src/rules/request/request-required-false-to-true.js';
import type { DiffSet, RuleContext } from '../../src/types/index.js';

describe('Request Rules', () => {
  const context: RuleContext = {
    config: { failOn: 'breaking', disabledRules: [], ignorePaths: [], output: { format: 'terminal' } },
    oldSpec: { meta: { title: 'v1', version: '1.0.0', format: 'openapi3', rawVersion: '3.0.0' }, servers: [], endpoints: [], components: { schemas: {}, securitySchemes: {}, parameters: {}, responses: {}, headers: {}, requestBodies: {} }, security: [] },
    newSpec: { meta: { title: 'v2', version: '2.0.0', format: 'openapi3', rawVersion: '3.0.0' }, servers: [], endpoints: [], components: { schemas: {}, securitySchemes: {}, parameters: {}, responses: {}, headers: {}, requestBodies: {} }, security: [] },
  };

  const dummyEndpoint = { id: 'POST:/test', path: '/test', method: 'POST' as const, summary: '', description: '', tags: [], deprecated: false, security: [], parameters: [], responses: [] };

  it('REQUEST_BODY_ADDED_REQUIRED triggers when required body is added', () => {
    const diff: DiffSet = {
      endpointDiffs: [
        { type: 'changed', endpointId: 'POST:/test', path: '/test', method: 'POST', oldEndpoint: dummyEndpoint, newEndpoint: dummyEndpoint, fieldChanges: [
          { fieldPath: ['requestBody'], changeType: 'added', newValue: { required: true, content: {} } }
        ]}
      ], componentDiffs: []
    };
    const rule = new RequestBodyAddedRequiredRule();
    const changes = rule.apply(diff, context);
    expect(changes).toHaveLength(1);
    expect(changes[0].ruleId).toBe('REQUEST_BODY_ADDED_REQUIRED');
  });

  it('REQUEST_BODY_REMOVED triggers when body is removed', () => {
    const diff: DiffSet = {
      endpointDiffs: [
        { type: 'changed', endpointId: 'POST:/test', path: '/test', method: 'POST', oldEndpoint: dummyEndpoint, newEndpoint: dummyEndpoint, fieldChanges: [
          { fieldPath: ['requestBody'], changeType: 'removed', oldValue: { required: false, content: {} } }
        ]}
      ], componentDiffs: []
    };
    const rule = new RequestBodyRemovedRule();
    const changes = rule.apply(diff, context);
    expect(changes).toHaveLength(1);
    expect(changes[0].ruleId).toBe('REQUEST_BODY_REMOVED');
  });

  it('REQUEST_CONTENT_TYPE_ADDED triggers when content type is added', () => {
    const diff: DiffSet = {
      endpointDiffs: [
        { type: 'changed', endpointId: 'POST:/test', path: '/test', method: 'POST', oldEndpoint: dummyEndpoint, newEndpoint: dummyEndpoint, fieldChanges: [
          { fieldPath: ['requestBody', 'content', 'application/json'], changeType: 'added', newValue: { schema: {} } }
        ]}
      ], componentDiffs: []
    };
    const rule = new RequestContentTypeAddedRule();
    const changes = rule.apply(diff, context);
    expect(changes).toHaveLength(1);
    expect(changes[0].ruleId).toBe('REQUEST_CONTENT_TYPE_ADDED');
  });

  it('REQUEST_CONTENT_TYPE_REMOVED triggers when content type is removed', () => {
    const diff: DiffSet = {
      endpointDiffs: [
        { type: 'changed', endpointId: 'POST:/test', path: '/test', method: 'POST', oldEndpoint: dummyEndpoint, newEndpoint: dummyEndpoint, fieldChanges: [
          { fieldPath: ['requestBody', 'content', 'application/json'], changeType: 'removed', oldValue: { schema: {} } }
        ]}
      ], componentDiffs: []
    };
    const rule = new RequestContentTypeRemovedRule();
    const changes = rule.apply(diff, context);
    expect(changes).toHaveLength(1);
    expect(changes[0].ruleId).toBe('REQUEST_CONTENT_TYPE_REMOVED');
  });

  it('REQUEST_FIELD_REMOVED triggers when field is removed', () => {
    const diff: DiffSet = {
      endpointDiffs: [
        { type: 'changed', endpointId: 'POST:/test', path: '/test', method: 'POST', oldEndpoint: dummyEndpoint, newEndpoint: dummyEndpoint, fieldChanges: [
          { fieldPath: ['requestBody', 'content', 'application/json', 'schema', 'properties', 'testField'], changeType: 'removed', oldValue: { type: 'string' } }
        ]}
      ], componentDiffs: []
    };
    const rule = new RequestFieldRemovedRule();
    const changes = rule.apply(diff, context);
    expect(changes).toHaveLength(1);
    expect(changes[0].ruleId).toBe('REQUEST_FIELD_REMOVED');
  });

  it('REQUEST_FIELD_ADDED_REQUIRED triggers when required field is added', () => {
    const diff: DiffSet = {
      endpointDiffs: [
        { type: 'changed', endpointId: 'POST:/test', path: '/test', method: 'POST', oldEndpoint: dummyEndpoint, newEndpoint: dummyEndpoint, fieldChanges: [
          { fieldPath: ['requestBody', 'content', 'application/json', 'schema', 'required', 'testField'], changeType: 'added', newValue: 'testField' },
          { fieldPath: ['requestBody', 'content', 'application/json', 'schema', 'properties', 'testField'], changeType: 'added', newValue: { type: 'string' } }
        ]}
      ], componentDiffs: []
    };
    const rule = new RequestFieldAddedRequiredRule();
    const changes = rule.apply(diff, context);
    expect(changes).toHaveLength(1);
    expect(changes[0].ruleId).toBe('REQUEST_FIELD_ADDED_REQUIRED');
  });

  it('REQUEST_FIELD_TYPE_CHANGED triggers when type changes', () => {
    const diff: DiffSet = {
      endpointDiffs: [
        { type: 'changed', endpointId: 'POST:/test', path: '/test', method: 'POST', oldEndpoint: dummyEndpoint, newEndpoint: dummyEndpoint, fieldChanges: [
          { fieldPath: ['requestBody', 'content', 'application/json', 'schema', 'properties', 'testField', 'type'], changeType: 'changed', oldValue: 'string', newValue: 'number' }
        ]}
      ], componentDiffs: []
    };
    const rule = new RequestFieldTypeChangedRule();
    const changes = rule.apply(diff, context);
    expect(changes).toHaveLength(1);
    expect(changes[0].ruleId).toBe('REQUEST_FIELD_TYPE_CHANGED');
  });

  it('REQUEST_REQUIRED_FALSE_TO_TRUE triggers when body becomes required', () => {
    const diff: DiffSet = {
      endpointDiffs: [
        { type: 'changed', endpointId: 'POST:/test', path: '/test', method: 'POST', oldEndpoint: dummyEndpoint, newEndpoint: dummyEndpoint, fieldChanges: [
          { fieldPath: ['requestBody', 'required'], changeType: 'changed', oldValue: false, newValue: true }
        ]}
      ], componentDiffs: []
    };
    const rule = new RequestRequiredFalseToTrueRule();
    const changes = rule.apply(diff, context);
    expect(changes).toHaveLength(1);
    expect(changes[0].ruleId).toBe('REQUEST_REQUIRED_FALSE_TO_TRUE');
  });

  it('REQUEST_REQUIRED_FALSE_TO_TRUE triggers when existing field becomes required', () => {
    const diff: DiffSet = {
      endpointDiffs: [
        { type: 'changed', endpointId: 'POST:/test', path: '/test', method: 'POST', oldEndpoint: dummyEndpoint, newEndpoint: dummyEndpoint, fieldChanges: [
          { fieldPath: ['requestBody', 'content', 'application/json', 'schema', 'required', 'testField'], changeType: 'added', newValue: 'testField' }
        ]}
      ], componentDiffs: []
    };
    const rule = new RequestRequiredFalseToTrueRule();
    const changes = rule.apply(diff, context);
    expect(changes).toHaveLength(1);
    expect(changes[0].ruleId).toBe('REQUEST_REQUIRED_FALSE_TO_TRUE');
  });
});
