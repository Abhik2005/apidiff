import { describe, it, expect } from 'vitest';
import { EndpointAddedRule } from '../../src/rules/endpoint/endpoint-added.js';
import { EndpointRemovedRule } from '../../src/rules/endpoint/endpoint-removed.js';
import { EndpointDeprecatedRule } from '../../src/rules/endpoint/endpoint-deprecated.js';
import { HttpMethodChangedRule } from '../../src/rules/endpoint/http-method-changed.js';
import { PathChangedRule } from '../../src/rules/endpoint/path-changed.js';
import type { DiffSet, EndpointDiff, RuleContext } from '../../src/types/index.js';

describe('Endpoint Rules', () => {
  const context: RuleContext = {
    config: { failOn: 'breaking', disabledRules: [], ignorePaths: [], output: { format: 'terminal' } },
    oldSpec: { meta: { title: 'v1', version: '1.0.0', format: 'openapi3', rawVersion: '3.0.0' }, servers: [], endpoints: [], components: { schemas: {}, securitySchemes: {}, parameters: {}, responses: {}, headers: {}, requestBodies: {} }, security: [] },
    newSpec: { meta: { title: 'v2', version: '2.0.0', format: 'openapi3', rawVersion: '3.0.0' }, servers: [], endpoints: [], components: { schemas: {}, securitySchemes: {}, parameters: {}, responses: {}, headers: {}, requestBodies: {} }, security: [] },
  };

  const dummyEndpoint = { id: 'GET:/test', path: '/test', method: 'GET' as const, summary: '', description: '', tags: [], deprecated: false, security: [], parameters: [], responses: [] };

  it('ENDPOINT_ADDED triggers on added endpoint', () => {
    const diff: DiffSet = {
      endpointDiffs: [
        { type: 'added', endpointId: 'GET:/test', path: '/test', method: 'GET', newEndpoint: dummyEndpoint, fieldChanges: [] }
      ],
      componentDiffs: []
    };
    
    const rule = new EndpointAddedRule();
    const changes = rule.apply(diff, context);
    expect(changes).toHaveLength(1);
    expect(changes[0].ruleId).toBe('ENDPOINT_ADDED');
    expect(changes[0].severity).toBe('info');
  });

  it('ENDPOINT_REMOVED triggers on removed endpoint', () => {
    const diff: DiffSet = {
      endpointDiffs: [
        { type: 'removed', endpointId: 'GET:/test', path: '/test', method: 'GET', oldEndpoint: dummyEndpoint, fieldChanges: [] }
      ],
      componentDiffs: []
    };
    
    const rule = new EndpointRemovedRule();
    const changes = rule.apply(diff, context);
    expect(changes).toHaveLength(1);
    expect(changes[0].ruleId).toBe('ENDPOINT_REMOVED');
    expect(changes[0].severity).toBe('breaking');
  });

  it('ENDPOINT_DEPRECATED triggers on deprecated change', () => {
    const diff: DiffSet = {
      endpointDiffs: [
        { 
          type: 'changed', 
          endpointId: 'GET:/test', 
          path: '/test', 
          method: 'GET', 
          oldEndpoint: dummyEndpoint, 
          newEndpoint: { ...dummyEndpoint, deprecated: true }, 
          fieldChanges: [
            { fieldPath: ['deprecated'], changeType: 'changed', oldValue: false, newValue: true }
          ] 
        }
      ],
      componentDiffs: []
    };
    
    const rule = new EndpointDeprecatedRule();
    const changes = rule.apply(diff, context);
    expect(changes).toHaveLength(1);
    expect(changes[0].ruleId).toBe('ENDPOINT_DEPRECATED');
    expect(changes[0].severity).toBe('warning');
  });

  it('HTTP_METHOD_CHANGED triggers on method change', () => {
    const diff: DiffSet = {
      endpointDiffs: [
        { 
          type: 'changed', 
          endpointId: 'GET:/test', 
          path: '/test', 
          method: 'POST', 
          oldEndpoint: dummyEndpoint, 
          newEndpoint: { ...dummyEndpoint, method: 'POST' }, 
          fieldChanges: [
            { fieldPath: ['method'], changeType: 'changed', oldValue: 'GET', newValue: 'POST' }
          ] 
        }
      ],
      componentDiffs: []
    };
    
    const rule = new HttpMethodChangedRule();
    const changes = rule.apply(diff, context);
    expect(changes).toHaveLength(1);
    expect(changes[0].ruleId).toBe('HTTP_METHOD_CHANGED');
    expect(changes[0].severity).toBe('breaking');
  });

  it('PATH_CHANGED triggers on path string change', () => {
    const diff: DiffSet = {
      endpointDiffs: [
        { 
          type: 'changed', 
          endpointId: 'GET:/test', 
          path: '/test-renamed', 
          method: 'GET', 
          oldEndpoint: dummyEndpoint, 
          newEndpoint: { ...dummyEndpoint, path: '/test-renamed' }, 
          fieldChanges: [
            { fieldPath: ['path'], changeType: 'changed', oldValue: '/test', newValue: '/test-renamed' }
          ] 
        }
      ],
      componentDiffs: []
    };
    
    const rule = new PathChangedRule();
    const changes = rule.apply(diff, context);
    expect(changes).toHaveLength(1);
    expect(changes[0].ruleId).toBe('PATH_CHANGED');
    expect(changes[0].severity).toBe('info');
  });
});
